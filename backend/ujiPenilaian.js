require('dotenv').config();

const fs = require('fs');
const path = require('path');

const prisma = require('./src/config/db');
const { nilaiRefleksi } = require('./src/services/penilaianRefleksiService');
const { ambilSoalDanKunci } = require('./src/services/refleksiSoalService');

/**
 * =====================================================================
 * SKRIP UJI PENILAIAN
 * =====================================================================
 *
 * Menguji mesin penilaian secara langsung, tanpa lewat antarmuka web.
 * Tidak ada login, tidak ada upload, tidak masuk antrian, dan TIDAK
 * menulis apa pun ke tabel Submission. Aman dijalankan berkali-kali.
 *
 * Dipakai untuk menjawab pertanyaan penguji: apakah sistem menilai
 * kesepadanan MAKNA, atau hanya mencocokkan kata?
 *
 * ---------------------------------------------------------------------
 * CARA PAKAI
 * ---------------------------------------------------------------------
 *
 *   node ujiPenilaian.js --pertemuan <pertemuanId>
 *   node ujiPenilaian.js --pertemuan <pertemuanId> --ulang 3
 *   node ujiPenilaian.js --pertemuan <pertemuanId> --file jawaban-saya.json
 *
 * Opsi:
 *   --pertemuan   WAJIB. id pertemuan yang soal refleksinya akan diuji
 *   --file        berkas jawaban (default: contoh-jawaban.json)
 *   --ulang       berapa kali tiap jawaban dinilai (default: 1)
 *                 gunakan 3 untuk mengukur konsistensi model
 *   --keluaran    nama berkas hasil (default: hasil-uji-<tanggal>.csv)
 *
 * ---------------------------------------------------------------------
 * FORMAT BERKAS JAWABAN
 * ---------------------------------------------------------------------
 *
 * [
 *   { "id": "A1", "kelompok": "SAMA",       "jawaban": "..." },
 *   { "id": "B1", "kelompok": "PARAFRASE",  "jawaban": "..." },
 *   { "id": "C1", "kelompok": "SALAH_MAKNA","jawaban": "..." }
 * ]
 *
 * Kelompok bebas dinamai, tetapi tiga kelompok di atas yang paling
 * meyakinkan untuk pengujian:
 *
 *   SAMA        - memakai istilah persis seperti materi (pembanding)
 *   PARAFRASE   - makna sama, kosakata berbeda
 *   SALAH_MAKNA - istilah benar tetapi konsepnya keliru
 *
 * Bila kelompok PARAFRASE mendekati SAMA sementara SALAH_MAKNA jatuh,
 * itulah bukti bahwa penilaian bekerja pada makna, bukan pada kata.
 * =====================================================================
 */

// ---------------------------------------------------------------------
// Pembacaan argumen
// ---------------------------------------------------------------------

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

// ---------------------------------------------------------------------
// Statistik sederhana
// ---------------------------------------------------------------------

function rataRata(angka) {
    if (angka.length === 0) return 0;
    return angka.reduce((a, b) => a + b, 0) / angka.length;
}

function simpanganBaku(angka) {

    if (angka.length < 2) return 0;

    const mean = rataRata(angka);

    const varians = angka
        .reduce((total, x) => total + Math.pow(x - mean, 2), 0) / (angka.length - 1);

    return Math.sqrt(varians);
}

// ---------------------------------------------------------------------
// Penulisan CSV
// ---------------------------------------------------------------------

function bungkusCsv(nilai) {

    const teks = String(nilai ?? '');

    if (/[",\n]/.test(teks)) {
        return `"${teks.replace(/"/g, '""')}"`;
    }

    return teks;
}

function tulisCsv(namaBerkas, baris) {

    if (baris.length === 0) return;

    const kolom = Object.keys(baris[0]);

    const isi = [
        kolom.join(','),
        ...baris.map(b => kolom.map(k => bungkusCsv(b[k])).join(','))
    ].join('\n');

    fs.writeFileSync(namaBerkas, '\ufeff' + isi, 'utf-8');
}

// ---------------------------------------------------------------------
// Program utama
// ---------------------------------------------------------------------

async function utama() {

    const opsi = bacaArgumen();

    if (!opsi.pertemuan) {
        console.error('\nGunakan: node ujiPenilaian.js --pertemuan <pertemuanId>\n');
        console.error('Cari id pertemuan dengan:');
        console.error('  node -e "require(\'./src/config/db\').pertemuan.findMany({select:{id:true,urutan:true,topik:true}}).then(console.table)"\n');
        process.exit(1);
    }

    const pertemuanId = opsi.pertemuan;
    const berkasJawaban = opsi.file || 'contoh-jawaban.json';
    const ulang = Math.max(1, Number(opsi.ulang) || 1);

    const tanggal = new Date().toISOString().slice(0, 10);
    const berkasKeluaran = opsi.keluaran || `hasil-uji-${tanggal}.csv`;

    // -----------------------------------------------------------------
    // 1. Periksa kesiapan soal dan kunci jawaban
    // -----------------------------------------------------------------

    const soal = await ambilSoalDanKunci(pertemuanId);

    if (!soal) {
        console.error('\nPertemuan ini belum punya soal refleksi.');
        console.error('Isi kolom refleksi pada materi, lalu simpan ulang materinya.\n');
        process.exit(1);
    }

    if (!soal.kunci || soal.kunci.status !== 'SUCCESS') {
        console.error(`\nKunci jawaban belum siap (status: ${soal.kunci?.status || 'belum dibuat'}).`);
        console.error('Pastikan materi sudah selesai di-index.\n');
        process.exit(1);
    }

    const poinKunci = Array.isArray(soal.kunci.keywords) ? soal.kunci.keywords : [];

    console.log('\n' + '='.repeat(70));
    console.log('SOAL YANG DIUJI');
    console.log('='.repeat(70));
    console.log(soal.pertanyaan);
    console.log('\nJAWABAN IDEAL MENURUT MATERI:');
    console.log(soal.kunci.expectedAnswer);
    console.log('\nPOIN KUNCI:');
    poinKunci.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
    console.log('='.repeat(70) + '\n');

    // -----------------------------------------------------------------
    // 2. Baca daftar jawaban
    // -----------------------------------------------------------------

    if (!fs.existsSync(berkasJawaban)) {
        console.error(`\nBerkas jawaban tidak ditemukan: ${berkasJawaban}\n`);
        process.exit(1);
    }

    const daftarJawaban = JSON.parse(fs.readFileSync(berkasJawaban, 'utf-8'));

    if (!Array.isArray(daftarJawaban) || daftarJawaban.length === 0) {
        console.error('\nBerkas jawaban kosong atau bukan array.\n');
        process.exit(1);
    }

    const totalPenilaian = daftarJawaban.length * ulang;

    console.log(`Jumlah jawaban : ${daftarJawaban.length}`);
    console.log(`Pengulangan    : ${ulang}x`);
    console.log(`Total penilaian: ${totalPenilaian}`);
    console.log(`Perkiraan waktu: sekitar ${Math.ceil(totalPenilaian * 45 / 60)} menit\n`);

    // -----------------------------------------------------------------
    // 3. Jalankan penilaian
    // -----------------------------------------------------------------

    const barisCsv = [];
    const skorPerJawaban = {};

    let nomor = 0;

    for (const item of daftarJawaban) {

        skorPerJawaban[item.id] = [];

        for (let putaran = 1; putaran <= ulang; putaran++) {

            nomor++;

            process.stdout.write(
                `[${nomor}/${totalPenilaian}] ${item.id} (${item.kelompok}) putaran ${putaran}... `
            );

            const mulai = Date.now();

            try {

                const hasil = await nilaiRefleksi({
                    pertemuanId,
                    jawabanMahasiswa: item.jawaban
                });

                const detik = ((Date.now() - mulai) / 1000).toFixed(1);

                const rubrik = hasil.aiRubrik;

                const terpenuhi = rubrik.cakupanPoin.filter(p => p.status === 'TERPENUHI').length;
                const sebagian = rubrik.cakupanPoin.filter(p => p.status === 'SEBAGIAN').length;
                const tidak = rubrik.cakupanPoin.filter(p => p.status === 'TIDAK').length;

                console.log(`skor ${hasil.score} (${detik} detik)`);

                skorPerJawaban[item.id].push(hasil.score);

                barisCsv.push({
                    id: item.id,
                    kelompok: item.kelompok || '',
                    putaran,
                    skor_total: hasil.score,
                    skor_poin_kunci: rubrik.skorPoinKunci,
                    skor_kualitas: rubrik.kualitasRefleksi.score,
                    poin_terpenuhi: terpenuhi,
                    poin_sebagian: sebagian,
                    poin_tidak: tidak,
                    jumlah_poin: rubrik.cakupanPoin.length,
                    detik: detik,
                    status_per_poin: rubrik.cakupanPoin
                        .map(p => `${p.poin} = ${p.status}`)
                        .join(' | '),
                    jawaban: item.jawaban
                });

            } catch (err) {

                console.log(`GAGAL: ${err.message}`);

                barisCsv.push({
                    id: item.id,
                    kelompok: item.kelompok || '',
                    putaran,
                    skor_total: '',
                    skor_poin_kunci: '',
                    skor_kualitas: '',
                    poin_terpenuhi: '',
                    poin_sebagian: '',
                    poin_tidak: '',
                    jumlah_poin: '',
                    detik: '',
                    status_per_poin: `GAGAL: ${err.message}`,
                    jawaban: item.jawaban
                });
            }
        }
    }

    // -----------------------------------------------------------------
    // 4. Ringkasan per jawaban
    // -----------------------------------------------------------------

    console.log('\n' + '='.repeat(70));
    console.log('RINGKASAN PER JAWABAN');
    console.log('='.repeat(70));

    const ringkasanJawaban = daftarJawaban.map(item => {

        const skor = skorPerJawaban[item.id].filter(s => typeof s === 'number');

        return {
            id: item.id,
            kelompok: item.kelompok || '',
            n: skor.length,
            rata2: skor.length ? Number(rataRata(skor).toFixed(1)) : '-',
            min: skor.length ? Math.min(...skor) : '-',
            max: skor.length ? Math.max(...skor) : '-',
            simpangan: skor.length > 1 ? Number(simpanganBaku(skor).toFixed(2)) : '-'
        };
    });

    console.table(ringkasanJawaban);

    // -----------------------------------------------------------------
    // 5. Ringkasan per kelompok - INI YANG DIPAKAI DI BAB HASIL
    // -----------------------------------------------------------------

    const kelompokUnik = [...new Set(daftarJawaban.map(j => j.kelompok || '-'))];

    const ringkasanKelompok = kelompokUnik.map(kelompok => {

        const skor = barisCsv
            .filter(b => (b.kelompok || '-') === kelompok && typeof b.skor_total === 'number')
            .map(b => b.skor_total);

        return {
            kelompok,
            jumlah_penilaian: skor.length,
            rata2_skor: skor.length ? Number(rataRata(skor).toFixed(1)) : '-',
            simpangan: skor.length > 1 ? Number(simpanganBaku(skor).toFixed(2)) : '-',
            min: skor.length ? Math.min(...skor) : '-',
            max: skor.length ? Math.max(...skor) : '-'
        };
    });

    console.log('\n' + '='.repeat(70));
    console.log('RINGKASAN PER KELOMPOK');
    console.log('='.repeat(70));

    console.table(ringkasanKelompok);

    // -----------------------------------------------------------------
    // 6. Simpan berkas
    // -----------------------------------------------------------------

    tulisCsv(berkasKeluaran, barisCsv);

    const berkasRingkasan = berkasKeluaran.replace(/\.csv$/, '-ringkasan.csv');
    tulisCsv(berkasRingkasan, ringkasanKelompok);

    console.log(`\nHasil rinci    : ${path.resolve(berkasKeluaran)}`);
    console.log(`Ringkasan      : ${path.resolve(berkasRingkasan)}`);
    console.log('\nKeduanya dapat langsung dibuka di Excel.\n');

    // -----------------------------------------------------------------
    // 7. Bacaan cepat
    // -----------------------------------------------------------------

    const sama = ringkasanKelompok.find(k => k.kelompok === 'SAMA');
    const parafrase = ringkasanKelompok.find(k => k.kelompok === 'PARAFRASE');
    const salah = ringkasanKelompok.find(k => k.kelompok === 'SALAH_MAKNA');

    if (sama && parafrase && typeof sama.rata2_skor === 'number') {

        const selisih = Math.abs(sama.rata2_skor - parafrase.rata2_skor);

        console.log('BACAAN CEPAT');
        console.log('-'.repeat(70));
        console.log(`Selisih SAMA vs PARAFRASE : ${selisih.toFixed(1)} poin`);
        console.log('  Selisih kecil menunjukkan penilaian tidak bergantung pada kesamaan kata.');

        if (salah && typeof salah.rata2_skor === 'number') {
            const jatuh = parafrase.rata2_skor - salah.rata2_skor;
            console.log(`Selisih PARAFRASE vs SALAH_MAKNA : ${jatuh.toFixed(1)} poin`);
            console.log('  Selisih besar menunjukkan sistem menolak jawaban yang kata kuncinya');
            console.log('  benar tetapi maknanya keliru.');
        }

        console.log('-'.repeat(70) + '\n');
    }

    await prisma.$disconnect();
}

utama().catch(async err => {
    console.error('\nGagal menjalankan pengujian:', err);
    await prisma.$disconnect().catch(() => { });
    process.exit(1);
});
