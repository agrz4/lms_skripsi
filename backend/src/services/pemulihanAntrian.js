const prisma = require("../config/db");
const { jalankanBerurutan } = require("./antrianAI");
const { nilaiRefleksi } = require("./penilaianRefleksiService");

/**
 * =====================================================================
 * PEMULIHAN ANTRIAN
 * =====================================================================
 */

const PENANDA_MENUNGGU = "Sedang diproses oleh AI";

/**
 * Mencari dan mengantre ulang penilaian yang tertinggal.
 *
 * @param {object} options
 * @param {number} options.batas jumlah maksimum yang diproses ulang
 * @returns {Promise<number>} jumlah submission yang diantre ulang
 */
async function pulihkanPenilaianTertinggal(options = {}) {

    const { batas = 200 } = options;

    let tertinggal = [];

    try {

        tertinggal = await prisma.submission.findMany({
            where: {
                type: "REFLEKSI",
                aiScore: null,
                score: null,
                content: { not: null },
                OR: [
                    { feedback: { contains: PENANDA_MENUNGGU } },
                    { feedback: null }
                ]
            },
            orderBy: { createdAt: "asc" },
            take: batas,
            select: {
                id: true,
                content: true,
                pertemuanId: true
            }
        });

    } catch (err) {
        console.error("[pemulihan] Gagal membaca submission tertinggal:", err.message);
        return 0;
    }

    if (tertinggal.length === 0) {
        console.log("[pemulihan] Tidak ada penilaian yang tertinggal.");
        return 0;
    }

    console.log(
        `[pemulihan] Menemukan ${tertinggal.length} penilaian tertinggal, ` +
        `memasukkan kembali ke antrian...`
    );

    for (const submission of tertinggal) {

        jalankanBerurutan(`Pemulihan refleksi: ${submission.id}`, async () => {

            try {

                const hasil = await nilaiRefleksi({
                    pertemuanId: submission.pertemuanId,
                    jawabanMahasiswa: submission.content
                });

                await prisma.submission.update({
                    where: { id: submission.id },
                    data: {
                        aiScore: hasil.score,
                        aiRubrik: hasil.aiRubrik,
                        feedback: `[AI Grader]: ${hasil.feedbackText}`
                    }
                });

                console.log(`[pemulihan] Selesai: ${submission.id} (skor ${hasil.score})`);

            } catch (err) {

                console.error(`[pemulihan] Gagal: ${submission.id} -`, err.message);

                await prisma.submission.update({
                    where: { id: submission.id },
                    data: {
                        aiScore: null,
                        feedback: `[AI Grader]: Penilaian otomatis gagal (${err.message}). `
                            + `Jawaban perlu dinilai manual atau diproses ulang.`
                    }
                }).catch(() => { /* abaikan */ });
            }
        });
    }

    return tertinggal.length;
}

module.exports = {
    pulihkanPenilaianTertinggal
};
