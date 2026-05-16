require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  console.log('🚀 Memulai proses pengisian jadwal otomatis...');

  // 1. Ambil semua kursus
  const courses = await prisma.mataKuliah.findMany();
  
  if (courses.length === 0) {
    console.log('❌ Tidak ada kursus ditemukan. Silakan buat kursus terlebih dahulu di UI.');
    return;
  }

  // 2. Ambil semua pengajar (Admin, Dosen, atau Asisten)
  const teachers = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'DOSEN', 'ASISTEN'] }
    }
  });

  if (teachers.length === 0) {
    console.log('❌ Tidak ada pengajar ditemukan. Silakan tambah pengajar terlebih dahulu.');
    return;
  }

  const topics = [
    'Pengenalan & Kontrak Perkuliahan',
    'Dasar-dasar dan Fundamental',
    'Deep Dive: Arsitektur & Struktur',
    'Implementasi Praktis Bagian 1',
    'Implementasi Praktis Bagian 2',
    'Review Materi & Quiz Kecil',
    'Persiapan Ujian Tengah Semester',
    'Analisis Kasus & Problem Solving',
    'Optimasi & Best Practices',
    'Integrasi Sistem & Keamanan',
    'Studi Kasus Industri',
    'Workshop & Live Coding',
    'Final Project Briefing',
    'Review Akhir & Persiapan UAS'
  ];

  for (const course of courses) {
    console.log(`\n📦 Mengisi jadwal untuk kursus: ${course.nama}`);

    const meetings = await prisma.pertemuan.findMany({
      where: { mataKuliahId: course.id },
      orderBy: { urutan: 'asc' }
    });

    if (meetings.length === 0) {
      console.log(`⚠️ Kursus ${course.nama} tidak memiliki slot pertemuan. Membuat 14 slot...`);
      // Jika karena alasan tertentu slot belum ada, buat di sini
      for (let i = 1; i <= 14; i++) {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const date = new Date();
        date.setDate(date.getDate() + (i * 7)); // Mingguan

        await prisma.pertemuan.create({
          data: {
            mataKuliahId: course.id,
            urutan: i,
            topik: topics[i-1],
            tgl: date,
            jam: '09:00',
            dosenId: teacher.id
          }
        });
      }
    } else {
      // Update slot yang sudah ada
      for (const meeting of meetings) {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const date = new Date();
        date.setDate(date.getDate() + (meeting.urutan * 7));

        await prisma.pertemuan.update({
          where: { id: meeting.id },
          data: {
            topik: topics[meeting.urutan - 1] || `Materi Pertemuan ${meeting.urutan}`,
            tgl: date,
            jam: '09:00',
            dosenId: teacher.id
          }
        });
        process.stdout.write('.');
      }
    }
    console.log(`\n✅ Selesai mengisi 14 jadwal untuk ${course.nama}`);
  }

  console.log('\n✨ Semua jadwal berhasil diperbarui! Silakan cek di browser.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
