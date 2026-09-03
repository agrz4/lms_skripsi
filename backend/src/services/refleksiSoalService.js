const prisma = require("../config/db");
const { buildExpectedAnswer } = require("./expectedAnswerService");

/**
 * =====================================================================
 * REFLEKSI SOAL SERVICE
 * =====================================================================
 *
 */

/**
 * Mengambil pertanyaan refleksi milik sebuah pertemuan.
 *
 * Satu pertemuan bisa punya beberapa materi, dan kolom `refleksi`
 * biasanya hanya terisi pada salah satunya. Bila lebih dari satu terisi,
 * semuanya digabung agar tidak ada pertanyaan yang hilang.
 *
 * @param {string} pertemuanId
 * @returns {Promise<string|null>}
 */
async function ambilPertanyaanRefleksi(pertemuanId) {

    const daftarMateri = await prisma.materi.findMany({
        where: { pertemuanId },
        orderBy: { createdAt: "asc" },
        select: { refleksi: true }
    });

    const pertanyaan = daftarMateri
        .map(materi => (materi.refleksi || "").trim())
        .filter(Boolean);

    if (pertanyaan.length === 0) return null;

    if (pertanyaan.length === 1) return pertanyaan[0];

    return pertanyaan
        .map((teks, index) => `${index + 1}. ${teks}`)
        .join("\n");
}

/**
 * Memastikan ada satu Soal bertipe ESSAY yang mewakili pertanyaan
 * refleksi pertemuan ini.
 *
 * Bila pertanyaannya berubah, isi soal ikut diperbarui dan kunci
 * jawaban lamanya ditandai kedaluwarsa agar dibangun ulang.
 *
 * @param {string} pertemuanId
 * @param {string} mataKuliahId
 * @param {string} dibuatOleh userId pembuat materi
 * @returns {Promise<object|null>} record Soal, atau null bila tidak ada pertanyaan
 */
async function pastikanSoalRefleksi(pertemuanId, mataKuliahId, dibuatOleh) {

    const pertanyaan = await ambilPertanyaanRefleksi(pertemuanId);

    if (!pertanyaan) {
        console.log("[refleksiSoal] Pertemuan ini tidak punya pertanyaan refleksi.");
        return null;
    }

    // Satu pertemuan hanya boleh punya satu soal refleksi.
    const soalLama = await prisma.soal.findFirst({
        where: {
            pertemuanId,
            tipesoal: "ESSAY"
        },
        include: { expectedAnswer: true }
    });

    if (!soalLama) {

        const soalBaru = await prisma.soal.create({
            data: {
                pertanyaan,
                tipesoal: "ESSAY",
                status: "APPROVED",
                mataKuliahId,
                pertemuanId,
                dibuatOleh
            }
        });

        console.log("[refleksiSoal] Soal refleksi dibuat:", soalBaru.id);

        return soalBaru;
    }

    if (soalLama.pertanyaan.trim() === pertanyaan.trim()) {
        return soalLama;
    }

    // Pertanyaan berubah -> kunci jawaban lama tidak berlaku lagi.
    const soalDiperbarui = await prisma.soal.update({
        where: { id: soalLama.id },
        data: { pertanyaan }
    });

    if (soalLama.expectedAnswer) {

        await prisma.expectedAnswer.update({
            where: { soalId: soalLama.id },
            data: { status: "OUTDATED" }
        });

        console.log("[refleksiSoal] Pertanyaan berubah, kunci jawaban ditandai kedaluwarsa.");
    }

    return soalDiperbarui;
}

const PENANDA_SIDIK = "materi:";

/**
 * Menyusun sidik dari daftar materi sebuah pertemuan.
 *
 * Berisi ID seluruh materi, diurutkan agar hasilnya stabil tanpa
 * bergantung pada urutan pembuatan. Bila ada materi ditambah, dihapus,
 * atau dibuat ulang, sidiknya berubah.
 */
async function hitungSidikMateri(pertemuanId) {

    const daftar = await prisma.materi.findMany({
        where: { pertemuanId },
        select: { id: true },
        orderBy: { id: "asc" }
    });

    return daftar.map(m => m.id).join(",");
}

/**
 * Membaca sidik materi yang tersimpan pada kunci jawaban.
 *
 * @returns {string|null} null bila belum ada penanda
 */
function bacaSidikMateri(learningObjectives) {

    if (typeof learningObjectives !== "string") return null;

    if (!learningObjectives.startsWith(PENANDA_SIDIK)) return null;

    return learningObjectives.slice(PENANDA_SIDIK.length);
}

/**
 * Menyiapkan soal refleksi sekaligus kunci jawabannya.
 *
 * Dipanggil setelah materi selesai di-index, karena pembuatan kunci
 * jawaban membutuhkan knowledge yang sudah masuk ke MateriVector.
 *
 * @param {object} materi record Materi
 * @returns {Promise<object|null>} record ExpectedAnswer, atau null
 */
async function siapkanKunciJawabanRefleksi(materi) {

    if (!materi?.pertemuanId || !materi?.mataKuliahId) {
        console.warn("[refleksiSoal] Materi tanpa pertemuan/mata kuliah, dilewati.");
        return null;
    }

    // Kolom dibuatOleh wajib diisi. Materi tidak menyimpan pembuatnya,
    // jadi dipakai dosen pertemuan; bila kosong, pakai admin mana pun.
    const pertemuan = await prisma.pertemuan.findUnique({
        where: { id: materi.pertemuanId },
        select: { dosenId: true, asistenId: true }
    });

    let pembuatId = pertemuan?.dosenId || pertemuan?.asistenId;

    if (!pembuatId) {

        const admin = await prisma.user.findFirst({
            where: { role: { in: ["ADMIN", "DOSEN"] } },
            select: { id: true }
        });

        pembuatId = admin?.id;
    }

    if (!pembuatId) {
        console.warn("[refleksiSoal] Tidak ada user yang dapat dijadikan pembuat soal.");
        return null;
    }

    const soal = await pastikanSoalRefleksi(
        materi.pertemuanId,
        materi.mataKuliahId,
        pembuatId
    );

    if (!soal) return null;

    // -----------------------------------------------------------------
    // Tunggu sampai SELURUH materi pertemuan selesai di-index.
    //
    // Halaman dosen menyimpan materi satu per satu: satu record untuk
    // video, satu lagi untuk PDF. Tiap record memicu proses latar
    // belakangnya sendiri. Bila kunci jawaban dibangun saat record
    // pertama selesai, knowledge yang tersedia baru sebagian, dan status
    // SUCCESS yang dihasilkan membuat record berikutnya melewati
    // pembangunan ulang. Akibatnya kunci jawaban hanya bersumber dari
    // video, sementara isi PDF tidak pernah ikut diperhitungkan.
    //
    // Karena proses berjalan berurutan lewat antrian, materi terakhirlah
    // yang akan lolos pemeriksaan ini dan membangun kunci jawaban dari
    // knowledge yang sudah lengkap.
    // -----------------------------------------------------------------

    const belumSiap = await prisma.materi.count({
        where: {
            pertemuanId: materi.pertemuanId,
            embeddingStatus: { not: "SUCCESS" }
        }
    });

    if (belumSiap > 0) {
        console.log(
            `[refleksiSoal] Masih ada ${belumSiap} materi yang belum ter-index. ` +
            `Pembuatan kunci jawaban ditunda sampai semuanya selesai.`
        );
        return null;
    }

    // -----------------------------------------------------------------
    // Tentukan apakah kunci jawaban perlu dibangun ulang.
    //
    // Versi sebelumnya hanya memeriksa status: bila sudah SUCCESS,
    // pembuatan dilewati. Asumsinya keliru, karena SUCCESS hanya berarti
    // "pernah berhasil dibuat", bukan "masih sesuai materi saat ini".
    //
    // Penyimpanan materi bekerja dengan menghapus seluruh materi
    // pertemuan lalu membuatnya kembali. Setiap record baru memperoleh
    // ID baru dan seluruh knowledge dibangun ulang dari nol. Karena itu
    // perubahan materi dapat dikenali dari berubahnya daftar ID materi.
    //
    // Sidik materi disimpan pada kolom learningObjectives yang selama
    // ini tidak terpakai, sehingga tidak perlu mengubah skema database.
    // -----------------------------------------------------------------

    const sidikSekarang = await hitungSidikMateri(materi.pertemuanId);

    const kunciLama = await prisma.expectedAnswer.findUnique({
        where: { soalId: soal.id }
    });

    if (kunciLama && kunciLama.status === "SUCCESS") {

        const sidikLama = bacaSidikMateri(kunciLama.learningObjectives);

        if (sidikLama === sidikSekarang) {
            console.log("[refleksiSoal] Materi tidak berubah, kunci jawaban dipertahankan.");
            return kunciLama;
        }

        if (sidikLama === null) {
            // Kunci jawaban dibuat sebelum penandaan ini ada.
            // Tidak dapat dipastikan masih sesuai, jadi dibangun ulang.
            console.log("[refleksiSoal] Kunci jawaban lama tanpa penanda materi, dibangun ulang.");
        } else {
            console.log("[refleksiSoal] Materi berubah sejak kunci jawaban dibuat, dibangun ulang.");
        }
    }

    console.log("[refleksiSoal] Membangun kunci jawaban untuk soal refleksi...");

    const kunciBaru = await buildExpectedAnswer(soal.id);

    // Catat materi mana yang menjadi sumber kunci jawaban ini.
    if (kunciBaru) {

        await prisma.expectedAnswer.update({
            where: { soalId: soal.id },
            data: { learningObjectives: `${PENANDA_SIDIK}${sidikSekarang}` }
        }).catch(err => {
            // Kegagalan mencatat sidik tidak membatalkan kunci jawaban.
            // Akibatnya hanya kunci akan dibangun ulang sekali lagi nanti.
            console.warn("[refleksiSoal] Gagal mencatat sidik materi:", err.message);
        });
    }

    return kunciBaru;
}

/**
 * Mengambil soal refleksi beserta kunci jawabannya untuk keperluan
 * penilaian. Mengembalikan null bila belum tersedia.
 *
 * @param {string} pertemuanId
 */
async function ambilSoalDanKunci(pertemuanId) {

    const soal = await prisma.soal.findFirst({
        where: {
            pertemuanId,
            tipesoal: "ESSAY"
        },
        include: { expectedAnswer: true }
    });

    if (!soal) return null;

    return {
        soalId: soal.id,
        pertanyaan: soal.pertanyaan,
        kunci: soal.expectedAnswer || null
    };
}

module.exports = {
    ambilPertanyaanRefleksi,
    pastikanSoalRefleksi,
    siapkanKunciJawabanRefleksi,
    ambilSoalDanKunci
};
