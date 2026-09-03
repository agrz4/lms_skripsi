const { callOllama } = require("./ollamaService");
const { ambilSoalDanKunci } = require("./refleksiSoalService");
const { GRADING_MODEL } = require("../config/aiConfig");

/**
 * =====================================================================
 * PENILAIAN REFLEKSI SERVICE
 * =====================================================================
 *
 */

const BOBOT_POIN_KUNCI = 70;
const BOBOT_KUALITAS = 30;

const PROMPT_VERSION = "penilaian-refleksi-v3-per-poin";

const STATUS_SAH = ["TERPENUHI", "SEBAGIAN", "TIDAK"];

/**
 * Prompt pemeriksaan satu poin kunci.
 *
 * Sengaja dibuat sependek mungkin. Kutipan materi dan jawaban ideal tidak
 * disertakan, karena poin kunci sudah merupakan sari dari keduanya, dan
 * penambahan konteks justru mengalihkan perhatian model kecil.
 */
function buildPromptPoin({ pertanyaan, poin, jawabanMahasiswa }) {

    return `
Tugas Anda: memeriksa APAKAH SATU GAGASAN tersampaikan dalam jawaban mahasiswa.

PERTANYAAN YANG DIJAWAB:
${pertanyaan}

GAGASAN YANG DIPERIKSA:
${poin}

JAWABAN MAHASISWA:
${jawabanMahasiswa}

CARA MENILAI:

TERPENUHI = gagasan tersampaikan, walaupun memakai kata, istilah, atau
            susunan kalimat yang berbeda.
SEBAGIAN  = gagasan tersinggung tetapi tidak lengkap atau kabur.
TIDAK     = gagasan tidak ada, atau jawaban menyatakan hal yang
            bertentangan dengan gagasan tersebut.

ATURAN:

1. Nilai MAKNANYA, bukan kesamaan kata. Menjelaskan ulang dengan bahasa
   sendiri tetap TERPENUHI.
2. Jawaban yang memakai istilah benar tetapi maknanya keliru adalah TIDAK.
3. Jawaban yang tidak membahas materi sama sekali adalah TIDAK.
4. Hanya nilai gagasan di atas. Jangan menilai gagasan lain.

Balas HANYA JSON berikut:

{ "status": "TERPENUHI atau SEBAGIAN atau TIDAK", "alasan": "kutipan singkat dari jawaban mahasiswa yang menjadi dasar keputusan" }
`;
}

/**
 * Prompt penilaian kualitas penyampaian.
 */
function buildPromptKualitas({ pertanyaan, jawabanMahasiswa, jumlahKata }) {

    return `
Tugas Anda: menilai KUALITAS PENYAMPAIAN sebuah jawaban refleksi.

PERTANYAAN:
${pertanyaan}

JAWABAN MAHASISWA (${jumlahKata} kata):
${jawabanMahasiswa}

Nilai kedalaman pemikiran, kejelasan penyampaian, dan kerapian bahasa
dengan rentang 0 sampai ${BOBOT_KUALITAS}.

Panduan:
- 0 sampai 9   : tidak jelas, tidak berkaitan dengan pertanyaan, atau
                 tidak menunjukkan pemahaman.
- 10 sampai 19 : cukup jelas tetapi dangkal atau sangat ringkas.
- 20 sampai ${BOBOT_KUALITAS} : jelas, tertata, dan menunjukkan pemikiran
                 sendiri atau kaitan dengan pengalaman.

Jangan menilai benar atau salahnya isi. Hal itu dinilai terpisah.

Balas HANYA JSON berikut:

{ "score": angka, "reason": "penjelasan singkat" }
`;
}

function hitungSkorPoinKunci(cakupanPoin) {

    if (!Array.isArray(cakupanPoin) || cakupanPoin.length === 0) {
        return null;
    }

    let nilai = 0;

    for (const item of cakupanPoin) {
        if (item.status === "TERPENUHI") nilai += 1;
        else if (item.status === "SEBAGIAN") nilai += 0.5;
    }

    return Math.round((nilai / cakupanPoin.length) * BOBOT_POIN_KUNCI);
}

/**
 * Membaca status dari keluaran satu pemeriksaan poin.
 *
 * Status yang tidak dikenali dianggap TIDAK dan ditandai tidak sah,
 * sehingga kegagalan model dapat dibedakan dari penilaian sungguhan.
 */
function bacaStatus(mentah) {

    const status = String(mentah?.status || "").trim().toUpperCase();

    if (STATUS_SAH.includes(status)) {
        return {
            status,
            alasan: typeof mentah?.alasan === "string" ? mentah.alasan.trim() : "",
            sah: true
        };
    }

    return {
        status: "TIDAK",
        alasan: "Model tidak mengembalikan status yang sah.",
        sah: false
    };
}

function susunTeksFeedback(hasil) {

    const baris = [];

    baris.push(
        `Skor AI ${hasil.score}/100 ` +
        `(cakupan poin kunci ${hasil.skorPoinKunci}/${hasil.bobotPoinKunci}, ` +
        `kualitas refleksi ${hasil.kualitasRefleksi.score}/${hasil.bobotKualitas}).`
    );

    const terpenuhi = hasil.cakupanPoin.filter(p => p.status === "TERPENUHI");
    const sebagian = hasil.cakupanPoin.filter(p => p.status === "SEBAGIAN");
    const tidak = hasil.cakupanPoin.filter(p => p.status === "TIDAK");

    baris.push("");
    baris.push(
        `RINCIAN POIN KUNCI (${terpenuhi.length} terpenuhi, ` +
        `${sebagian.length} sebagian, ${tidak.length} tidak):`
    );

    hasil.cakupanPoin.forEach(item => {

        const tanda =
            item.status === "TERPENUHI" ? "[v]"
            : item.status === "SEBAGIAN" ? "[~]"
            : "[x]";

        baris.push(`${tanda} ${item.nomor}. ${item.poin}`);

        if (item.alasan) {
            baris.push(`     Dasar penilaian: ${item.alasan}`);
        }
    });

    if (hasil.kualitasRefleksi.reason) {
        baris.push("");
        baris.push(`KUALITAS REFLEKSI: ${hasil.kualitasRefleksi.reason}`);
    }

    const belum = hasil.cakupanPoin
        .filter(item => item.status !== "TERPENUHI")
        .map(item => item.poin);

    if (belum.length > 0) {
        baris.push("");
        baris.push(`PERLU DIPERBAIKI: ${belum.join("; ")}`);
    }

    baris.push("");
    baris.push(
        "Catatan: skor di atas adalah referensi otomatis. " +
        "Nilai akhir ditentukan asisten."
    );

    return baris.join("\n").trim();
}

/**
 * Menilai satu jawaban refleksi.
 */
async function nilaiRefleksi({ pertemuanId, jawabanMahasiswa }) {

    const jumlahKata = jawabanMahasiswa
        .split(/\s+/)
        .filter(Boolean)
        .length;

    const soal = await ambilSoalDanKunci(pertemuanId);

    if (!soal) {
        throw new Error(
            "Pertemuan ini belum memiliki pertanyaan refleksi. " +
            "Isi kolom refleksi pada materi terlebih dahulu."
        );
    }

    if (!soal.kunci || soal.kunci.status !== "SUCCESS") {
        throw new Error(
            "Kunci jawaban untuk pertanyaan refleksi belum tersedia " +
            `(status: ${soal.kunci?.status || "belum dibuat"}). ` +
            "Pastikan materi sudah di-index dan kunci jawaban sudah dibangun."
        );
    }

    const poinKunci = Array.isArray(soal.kunci.keywords)
        ? soal.kunci.keywords.filter(item => typeof item === "string" && item.trim())
        : [];

    if (poinKunci.length === 0) {
        throw new Error("Kunci jawaban tidak memuat satu pun poin kunci.");
    }

    console.log("========== PENILAIAN REFLEKSI ==========");
    console.log("Pertanyaan  :", soal.pertanyaan.slice(0, 80));
    console.log("Poin kunci  :", poinKunci.length);
    console.log("Jumlah kata :", jumlahKata);
    console.log("Model nilai :", GRADING_MODEL);
    console.log("========================================");

    // ---- Periksa tiap poin melalui panggilan terpisah ----

    const cakupanPoin = [];

    let jumlahSah = 0;

    for (let i = 0; i < poinKunci.length; i++) {

        const poin = poinKunci[i];

        let hasilPoin;

        try {

            // Model penilaian dipisahkan dari model vision melalui
            // GRADING_MODEL. Lihat keterangan pada aiConfig.
            const mentah = await callOllama(
                buildPromptPoin({
                    pertanyaan: soal.pertanyaan,
                    poin,
                    jawabanMahasiswa
                }),
                GRADING_MODEL
            );

            hasilPoin = bacaStatus(mentah);

        } catch (err) {

            console.warn(`[penilaianRefleksi] Poin ${i + 1} gagal diperiksa:`, err.message);

            hasilPoin = {
                status: "TIDAK",
                alasan: "Pemeriksaan poin ini gagal dijalankan.",
                sah: false
            };
        }

        if (hasilPoin.sah) jumlahSah++;

        console.log(`  Poin ${i + 1}: ${hasilPoin.status}`);

        cakupanPoin.push({
            nomor: i + 1,
            poin,
            status: hasilPoin.status,
            alasan: hasilPoin.alasan
        });
    }

    if (jumlahSah === 0) {
        throw new Error(
            "Model tidak mengembalikan status yang sah untuk satu pun poin kunci."
        );
    }

    // ---- Nilai kualitas melalui panggilan terpisah ----

    let skorKualitas = 0;
    let alasanKualitas = "";

    try {

        const mentahKualitas = await callOllama(
            buildPromptKualitas({
                pertanyaan: soal.pertanyaan,
                jawabanMahasiswa,
                jumlahKata
            }),
            GRADING_MODEL
        );

        skorKualitas = Math.min(
            BOBOT_KUALITAS,
            Math.max(0, Math.round(Number(mentahKualitas?.score) || 0))
        );

        alasanKualitas = typeof mentahKualitas?.reason === "string"
            ? mentahKualitas.reason.trim()
            : "";

    } catch (err) {
        console.warn("[penilaianRefleksi] Penilaian kualitas gagal:", err.message);
    }

    // ---- Hitung skor akhir ----

    const skorPoinKunci = hitungSkorPoinKunci(cakupanPoin) ?? 0;

    const total = Math.min(100, Math.max(0, skorPoinKunci + skorKualitas));

    const hasil = {
        versi: PROMPT_VERSION,
        cakupanPoin,
        jumlahDinilai: jumlahSah,
        skorPoinKunci,
        bobotPoinKunci: BOBOT_POIN_KUNCI,
        kualitasRefleksi: {
            score: skorKualitas,
            reason: alasanKualitas
        },
        bobotKualitas: BOBOT_KUALITAS,
        score: total,
        feedback: {
            ringkasan: "",
            sudahBaik: [],
            perluDiperbaiki: []
        }
    };

    console.log(
        `[penilaianRefleksi] Skor ${total} ` +
        `(poin kunci ${skorPoinKunci}/${BOBOT_POIN_KUNCI}, ` +
        `kualitas ${skorKualitas}/${BOBOT_KUALITAS})`
    );

    return {
        score: total,
        aiRubrik: hasil,
        feedbackText: susunTeksFeedback(hasil),
        soalId: soal.soalId
    };
}

module.exports = {
    nilaiRefleksi,
    buildPromptPoin,
    buildPromptKualitas,
    hitungSkorPoinKunci,
    bacaStatus,
    susunTeksFeedback,
    BOBOT_POIN_KUNCI,
    BOBOT_KUALITAS
};
