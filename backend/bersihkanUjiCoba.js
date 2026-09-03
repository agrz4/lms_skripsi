require('dotenv').config();

const prisma = require('./src/config/db');

/**
 * =====================================================================
 * PEMBERSIH DATA UJI COBA
 * =====================================================================
 *
 * Menghapus data sisa pengujian dengan urutan yang benar.
 *
 * Mengapa urutan penting:
 * Hanya DUA relasi di skema ini yang memakai onDelete: Cascade, yaitu
 * ExpectedAnswer -> Soal dan MateriVector -> Materi. Sisanya memakai
 * perilaku bawaan Prisma, yaitu RESTRICT: induk TIDAK BISA dihapus
 * selama masih ada anak yang menunjuk kepadanya.
 *
 * Karena itu menghapus Pertemuan atau User secara langsung akan gagal
 * dengan galat foreign key, bukan menghapus diam-diam. Ini justru
 * pengaman: database menolak merusak dirinya sendiri.
 *
 * ---------------------------------------------------------------------
 * CARA PAKAI
 * ---------------------------------------------------------------------
 *
 *   node bersihkanUjiCoba.js --daftar
 *       Menampilkan isi database, tidak menghapus apa pun.
 *
 *   node bersihkanUjiCoba.js --pertemuan <id> --reset-kunci --ya
 *       Menghapus kunci jawaban saja, agar dibangun ulang saat materi
 *       disimpan berikutnya.
 *
 *   node bersihkanUjiCoba.js --pertemuan <id> --hapus-jawaban --ya
 *       Menghapus submission mahasiswa pada pertemuan itu.
 *
 *   node bersihkanUjiCoba.js --pertemuan <id> --reset-penuh --ya
 *       Mengosongkan pertemuan: submission, progres, materi, soal, dan
 *       kunci jawaban. Pertemuannya sendiri TIDAK dihapus.
 *
 * Tanpa --ya, skrip hanya menampilkan apa yang AKAN dihapus.
 * =====================================================================
 */

function bacaArgumen() {

    const argumen = process.argv.slice(2);
    const hasil = {};

    for (let i = 0; i < argumen.length; i++) {

        if (!argumen[i].startsWith('--')) continue;

        const kunci = argumen[i].replace(/^--/, '');
        const nilai = argumen[i + 1];

        if (nilai && !nilai.startsWith('--')) {
            hasil[kunci] = nilai;
            i++;
        } else {
            hasil[kunci] = true;
        }
    }

    return hasil;
}

/**
 * Menampilkan isi database secara ringkas.
 */
async function tampilkanDaftar() {

    const jumlah = {
        MataKuliah: await prisma.mataKuliah.count(),
        Pertemuan: await prisma.pertemuan.count(),
        Materi: await prisma.materi.count(),
        MateriVector: await prisma.materiVector.count(),
        Soal: await prisma.soal.count(),
        ExpectedAnswer: await prisma.expectedAnswer.count(),
        Submission: await prisma.submission.count(),
        StudentProgress: await prisma.studentProgress.count(),
        User: await prisma.user.count()
    };

    console.log('\nISI DATABASE SAAT INI');
    console.table(jumlah);

    const pertemuan = await prisma.pertemuan.findMany({
        select: {
            id: true,
            urutan: true,
            topik: true,
            mataKuliah: { select: { nama: true } },
            _count: { select: { materi: true, soal: true, submissions: true } }
        },
        orderBy: { urutan: 'asc' }
    });

    console.log('\nDAFTAR PERTEMUAN');

    console.table(pertemuan.map(p => ({
        id: p.id,
        mataKuliah: p.mataKuliah?.nama || '-',
        urutan: p.urutan,
        topik: (p.topik || '-').slice(0, 30),
        materi: p._count.materi,
        soal: p._count.soal,
        jawaban: p._count.submissions
    })));

    console.log('\nSalin id pertemuan yang ingin dibersihkan.\n');
}

/**
 * Menghapus kunci jawaban milik satu pertemuan.
 *
 * Berguna setelah memperbaiki materi yang sebelumnya gagal terproses.
 * Tanpa langkah ini, kunci jawaban lama yang berstatus SUCCESS akan
 * dipertahankan dan TIDAK dibangun ulang, karena sistem menganggapnya
 * masih berlaku.
 */
async function resetKunci(pertemuanId, jalankan) {

    const soal = await prisma.soal.findMany({
        where: { pertemuanId, tipesoal: 'ESSAY' },
        include: { expectedAnswer: true }
    });

    const punyaKunci = soal.filter(s => s.expectedAnswer);

    console.log(`\nSoal refleksi ditemukan : ${soal.length}`);
    console.log(`Punya kunci jawaban    : ${punyaKunci.length}`);

    for (const s of punyaKunci) {
        console.log(`  - ${s.pertanyaan.slice(0, 60)} (status: ${s.expectedAnswer.status})`);
    }

    if (!jalankan) {
        console.log('\nMode pratinjau. Tambahkan --ya untuk benar-benar menghapus.\n');
        return;
    }

    const hasil = await prisma.expectedAnswer.deleteMany({
        where: { soalId: { in: soal.map(s => s.id) } }
    });

    console.log(`\n${hasil.count} kunci jawaban dihapus.`);
    console.log('Simpan ulang materi pertemuan ini agar kunci dibangun kembali.\n');
}

/**
 * Menghapus jawaban mahasiswa pada satu pertemuan.
 */
async function hapusJawaban(pertemuanId, jalankan) {

    const jumlah = await prisma.submission.count({ where: { pertemuanId } });

    console.log(`\nSubmission pada pertemuan ini: ${jumlah}`);

    if (!jalankan) {
        console.log('Mode pratinjau. Tambahkan --ya untuk benar-benar menghapus.\n');
        return;
    }

    const hasil = await prisma.submission.deleteMany({ where: { pertemuanId } });

    console.log(`${hasil.count} submission dihapus.\n`);
}

/**
 * Mengosongkan satu pertemuan.
 *
 * Urutannya mengikuti arah relasi: anak dulu, induk belakangan.
 * Pertemuannya sendiri tidak dihapus agar tautan di antarmuka tidak
 * rusak dan materi baru masih bisa diunggah ke tempat yang sama.
 */
async function resetPenuh(pertemuanId, jalankan) {

    const pertemuan = await prisma.pertemuan.findUnique({
        where: { id: pertemuanId },
        include: {
            _count: { select: { materi: true, soal: true, submissions: true, progress: true } }
        }
    });

    if (!pertemuan) {
        console.error('\nPertemuan tidak ditemukan.\n');
        return;
    }

    console.log('\nYANG AKAN DIHAPUS');
    console.table({
        Submission: pertemuan._count.submissions,
        StudentProgress: pertemuan._count.progress,
        Materi: pertemuan._count.materi,
        Soal: pertemuan._count.soal
    });

    console.log('MateriVector dan ExpectedAnswer ikut terhapus otomatis (cascade).');
    console.log('Pertemuan itu sendiri TIDAK dihapus.');

    if (!jalankan) {
        console.log('\nMode pratinjau. Tambahkan --ya untuk benar-benar menghapus.\n');
        return;
    }

    const soal = await prisma.soal.findMany({
        where: { pertemuanId },
        select: { id: true }
    });

    const soalIds = soal.map(s => s.id);

    // 1. Jawaban dan progres mahasiswa (tidak punya anak)
    const submission = await prisma.submission.deleteMany({ where: { pertemuanId } });
    const progres = await prisma.studentProgress.deleteMany({ where: { pertemuanId } });

    // 2. Anak-anak dari Soal yang TIDAK cascade.
    //    Evaluasi dan SoalVector harus dihapus lebih dulu, kalau tidak
    //    penghapusan Soal akan ditolak database.
    let evaluasi = { count: 0 };
    let soalVector = { count: 0 };

    if (soalIds.length > 0) {
        evaluasi = await prisma.evaluasi.deleteMany({ where: { soalId: { in: soalIds } } });
        soalVector = await prisma.soalVector.deleteMany({ where: { soalId: { in: soalIds } } });
    }

    // 3. Soal (ExpectedAnswer ikut terhapus lewat cascade)
    const soalTerhapus = await prisma.soal.deleteMany({ where: { pertemuanId } });

    // 4. Materi (MateriVector ikut terhapus lewat cascade)
    const materi = await prisma.materi.deleteMany({ where: { pertemuanId } });

    console.log('\nSELESAI');
    console.table({
        Submission: submission.count,
        StudentProgress: progres.count,
        Evaluasi: evaluasi.count,
        SoalVector: soalVector.count,
        Soal: soalTerhapus.count,
        Materi: materi.count
    });

    console.log('\nPertemuan siap diisi ulang dari halaman dosen atau admin.\n');
}

async function utama() {

    const opsi = bacaArgumen();
    const jalankan = opsi.ya === true;

    if (opsi.daftar) {
        await tampilkanDaftar();
        await prisma.$disconnect();
        return;
    }

    if (!opsi.pertemuan) {
        console.log('\nGunakan salah satu:');
        console.log('  node bersihkanUjiCoba.js --daftar');
        console.log('  node bersihkanUjiCoba.js --pertemuan <id> --reset-kunci');
        console.log('  node bersihkanUjiCoba.js --pertemuan <id> --hapus-jawaban');
        console.log('  node bersihkanUjiCoba.js --pertemuan <id> --reset-penuh');
        console.log('\nTambahkan --ya untuk benar-benar menghapus.\n');
        await prisma.$disconnect();
        return;
    }

    if (opsi['reset-kunci']) {
        await resetKunci(opsi.pertemuan, jalankan);
    }
    else if (opsi['hapus-jawaban']) {
        await hapusJawaban(opsi.pertemuan, jalankan);
    }
    else if (opsi['reset-penuh']) {
        await resetPenuh(opsi.pertemuan, jalankan);
    }
    else {
        console.log('\nPilih tindakan: --reset-kunci, --hapus-jawaban, atau --reset-penuh\n');
    }

    await prisma.$disconnect();
}

utama().catch(async err => {
    console.error('\nGagal:', err.message);
    await prisma.$disconnect().catch(() => { });
    process.exit(1);
});
