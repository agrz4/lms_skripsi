const prisma = require("../config/db");

const { cariMateriRelevan } = require("./materiRagService");
const { callOllama } = require("./ollamaService");
const { CHAT_MODEL } = require("../config/aiConfig");

/**
 * =====================================================================
 * EXPECTED ANSWER SERVICE
 * =====================================================================
 *
 * Membangun kunci jawaban otomatis dari materi dosen (RAG).
 *
 * Catatan perbaikan dari versi sebelumnya:
 *
 * 1. Prompt tidak pernah terpakai.
 *    buildPrompt() dideklarasikan sebagai fungsi di dalam
 *    buildExpectedAnswer(), tetapi tidak pernah dipanggil. Baris
 *    callOllama(prompt) merujuk variabel "prompt" yang tidak ada,
 *    sehingga fungsi selalu melempar ReferenceError.
 *
 * 2. Relasi Prisma salah.
 *    Kode lama memakai include: { materi: { include: { pertemuan } } },
 *    padahal model Soal tidak memiliki relasi "materi". Yang tersedia
 *    adalah pertemuanId langsung pada Soal.
 *
 * 3. Tidak ada module.exports, sehingga fungsi ini tidak pernah dapat
 *    dipanggil dari controller mana pun.
 *
 * 4. Hasil tidak pernah disimpan ke tabel ExpectedAnswer.
 * =====================================================================
 */

const PROMPT_VERSION = "expected-answer-v2";

/**
 * Menyusun prompt kunci jawaban.
 */
function buildPrompt(knowledge, question) {

    return `
Anda adalah seorang DOSEN UNIVERSITAS yang sedang menyusun KUNCI JAWABAN RESMI.

==========================
ATURAN WAJIB
==========================

Jawaban HANYA boleh disusun dari MATERI di bawah ini.

Jika jawaban tidak dapat ditemukan secara eksplisit pada materi,
JANGAN menggunakan pengetahuan umum model.

Jangan melengkapi informasi.
Jangan menyimpulkan di luar materi.
Jangan mengira-ngira.

==========================
MATERI
==========================

${knowledge}

==========================
PERTANYAAN
==========================

${question}

==========================
FORMAT KELUARAN
==========================

Jika jawaban TIDAK ditemukan pada materi, keluarkan:

{
  "found": false,
  "expectedAnswer": "Informasi tersebut tidak terdapat pada materi yang diberikan.",
  "keyPoints": [],
  "rubric": []
}

Jika jawaban ditemukan, keluarkan:

{
  "found": true,
  "expectedAnswer": "jawaban lengkap dalam bahasa Indonesia formal",
  "keyPoints": ["poin penting 1", "poin penting 2"],
  "rubric": [
    { "point": "aspek yang dinilai", "score": 25 }
  ]
}

Total seluruh nilai pada rubric harus tepat 100.

Keluaran HARUS berupa JSON murni.
Jangan menggunakan markdown.
Jangan menggunakan tanda kutip tiga.
`;
}

/**
 * Membersihkan dan memvalidasi keluaran model.
 */
function normalisasiHasil(hasil) {

    const found = hasil?.found === true;

    const expectedAnswer =
        typeof hasil?.expectedAnswer === "string"
            ? hasil.expectedAnswer.trim()
            : "";

    const keyPoints = Array.isArray(hasil?.keyPoints)
        ? hasil.keyPoints
            .map(item => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean)
        : [];

    let rubric = Array.isArray(hasil?.rubric)
        ? hasil.rubric
            .filter(item => item && typeof item.point === "string")
            .map(item => ({
                point: item.point.trim(),
                score: Number(item.score) || 0
            }))
        : [];

    // Normalisasi bobot agar totalnya 100
    const total = rubric.reduce((jumlah, item) => jumlah + item.score, 0);

    if (rubric.length > 0 && total > 0 && Math.abs(total - 100) > 1) {

        rubric = rubric.map(item => ({
            point: item.point,
            score: Math.round((item.score / total) * 100)
        }));
    }

    return { found, expectedAnswer, keyPoints, rubric };
}

/**
 * Membangun kunci jawaban untuk satu soal.
 *
 * @param {string} soalId
 * @param {object} options
 * @param {number} options.topK jumlah chunk materi yang diambil
 * @returns {Promise<object>} record ExpectedAnswer dari database
 */
async function buildExpectedAnswer(soalId, options = {}) {

    const { topK = 5 } = options;

    // -----------------------------------------------------------------
    // 1. Ambil soal
    // -----------------------------------------------------------------

    const soal = await prisma.soal.findUnique({
        where: { id: soalId },
        include: { pertemuan: true }
    });

    if (!soal) {
        throw new Error("Soal tidak ditemukan.");
    }

    if (!soal.pertemuanId) {
        throw new Error(
            "Soal belum terhubung ke pertemuan, materi rujukan tidak dapat ditentukan."
        );
    }

    await prisma.expectedAnswer.upsert({
        where: { soalId },
        update: { status: "PROCESSING" },
        create: {
            soalId,
            status: "PROCESSING",
            model: CHAT_MODEL,
            promptVersion: PROMPT_VERSION
        }
    });

    try {

        // -------------------------------------------------------------
        // 2. Ambil knowledge relevan (RAG)
        // -------------------------------------------------------------

        const potongan = await cariMateriRelevan(
            soal.pertemuanId,
            soal.pertanyaan,
            topK
        );

        const knowledge = potongan
            .map(item => item.content)
            .join("\n\n");

        if (!knowledge.trim()) {
            throw new Error(
                "Knowledge kosong. Materi pertemuan ini belum di-index."
            );
        }

        console.log("========== EXPECTED ANSWER ==========");
        console.log("Soal      :", soal.pertanyaan.slice(0, 80));
        console.log("Chunk     :", potongan.length);
        console.log("Similarity:", potongan.map(p => p.similarity.toFixed(3)).join(", "));
        console.log("=====================================");

        // -------------------------------------------------------------
        // 3. Panggil model
        // -------------------------------------------------------------

        const prompt = buildPrompt(knowledge, soal.pertanyaan);

        const mentah = await callOllama(prompt);

        const hasil = normalisasiHasil(mentah);

        if (hasil.found && !hasil.expectedAnswer) {
            throw new Error("Model menyatakan found=true tetapi jawaban kosong.");
        }

        // -------------------------------------------------------------
        // 4. Simpan
        // -------------------------------------------------------------

        const tersimpan = await prisma.expectedAnswer.upsert({

            where: { soalId },

            update: {
                expectedAnswer: hasil.expectedAnswer,
                keywords: hasil.keyPoints,
                rubric: hasil.rubric,
                status: hasil.found ? "SUCCESS" : "NOT_FOUND",
                model: CHAT_MODEL,
                promptVersion: PROMPT_VERSION
            },

            create: {
                soalId,
                expectedAnswer: hasil.expectedAnswer,
                keywords: hasil.keyPoints,
                rubric: hasil.rubric,
                status: hasil.found ? "SUCCESS" : "NOT_FOUND",
                model: CHAT_MODEL,
                promptVersion: PROMPT_VERSION
            }
        });

        console.log(
            `[expectedAnswer] Selesai untuk soal ${soalId} (status: ${tersimpan.status})`
        );

        return tersimpan;

    } catch (err) {

        console.error("[expectedAnswer] Gagal:", err.message);

        await prisma.expectedAnswer.upsert({
            where: { soalId },
            update: { status: "FAILED" },
            create: {
                soalId,
                status: "FAILED",
                model: CHAT_MODEL,
                promptVersion: PROMPT_VERSION
            }
        }).catch(() => { /* abaikan kegagalan pencatatan status */ });

        throw err;
    }
}

/**
 * Membangun kunci jawaban untuk banyak soal secara berurutan.
 * Sengaja tidak paralel agar Ollama tidak kehabisan RAM.
 */
async function buildExpectedAnswerBatch(soalIds = []) {

    const hasil = [];

    for (const soalId of soalIds) {

        try {
            hasil.push({
                soalId,
                status: "SUCCESS",
                data: await buildExpectedAnswer(soalId)
            });
        } catch (err) {
            hasil.push({
                soalId,
                status: "FAILED",
                error: err.message
            });
        }
    }

    return hasil;
}

module.exports = {
    buildExpectedAnswer,
    buildExpectedAnswerBatch,
    buildPrompt
};
