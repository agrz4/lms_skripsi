/**
 * =====================================================================
 * ANTRIAN AI
 * =====================================================================
 *
 */

let rantai = Promise.resolve();

let jumlahMenunggu = 0;
let sedangBerjalan = null;

// Nomor urut global, dipakai untuk memberi tahu pengguna posisi antreannya.
let nomorTerakhir = 0;

/**
 * Memasukkan satu pekerjaan ke antrian.
 *
 * @param {string} nama label untuk log
 * @param {Function} tugas fungsi async yang akan dijalankan
 * @returns {Promise<any>} hasil tugas
 */
function jalankanBerurutan(nama, tugas) {

    jumlahMenunggu += 1;
    nomorTerakhir += 1;

    const nomor = nomorTerakhir;
    const posisiSaatMasuk = jumlahMenunggu;

    console.log(
        `[antrianAI] Masuk antrean: ${nama} ` +
        `(menunggu: ${jumlahMenunggu}${sedangBerjalan ? `, sedang jalan: ${sedangBerjalan}` : ""})`
    );

    const hasil = rantai.then(async () => {

        jumlahMenunggu -= 1;
        sedangBerjalan = `#${nomor} ${nama}`;

        const mulai = Date.now();

        console.log(`[antrianAI] MULAI: ${nama}`);

        try {

            return await tugas();

        } finally {

            const detik = ((Date.now() - mulai) / 1000).toFixed(1);

            console.log(
                `[antrianAI] SELESAI: ${nama} (${detik} detik, ` +
                `sisa antrean: ${jumlahMenunggu})`
            );

            sedangBerjalan = null;
        }
    });

    // Kegagalan satu pekerjaan tidak boleh memutus rantai,
    // sehingga pekerjaan berikutnya tetap berjalan.
    rantai = hasil.catch(() => { });

    // Posisi antrean dilampirkan agar pemanggil dapat menampilkannya
    // kepada pengguna tanpa perlu endpoint tambahan.
    hasil.posisiAntrean = posisiSaatMasuk;
    hasil.nomorAntrean = nomor;

    return hasil;
}

/**
 * Perkiraan lama menunggu, dalam detik.
 * Dipakai hanya untuk memberi gambaran kepada pengguna, bukan janji.
 *
 * @param {number} posisi posisi dalam antrean
 * @param {number} perkiraanDetikPerTugas rata-rata lama satu penilaian
 */
function perkiraanTunggu(posisi, perkiraanDetikPerTugas = 45) {
    return Math.max(0, (posisi - 1) * perkiraanDetikPerTugas);
}

/**
 * Kondisi antrian saat ini, berguna untuk endpoint pemantauan.
 */
function statusAntrian() {

    return {
        menunggu: jumlahMenunggu,
        sedangBerjalan
    };
}

module.exports = {
    jalankanBerurutan,
    statusAntrian,
    perkiraanTunggu
};
