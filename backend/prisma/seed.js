const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  const password = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  console.log('Sedang membersihkan transaksi lama...');
  try {
    // Delete pendaftaran first to clear foreign key refs to user and courses
    await prisma.pendaftaran.deleteMany();
    // Delete packages (no other tables depend on this)
    await prisma.paket.deleteMany();
    // Delete soal vectors
    await prisma.soalVector.deleteMany();
  } catch (err) {
    console.log('Pembersihan data awal dilewati:', err.message);
  }

  console.log('Sedang memasukkan data seed...');

  // 1. Upsert Users (prevents unique constraint errors)
  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: { nama: 'Admin Kursus', password: adminPassword, role: 'ADMIN' },
    create: {
      email: 'admin@lms.com',
      nama: 'Admin Kursus',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Pengajar (Dosen)
  const dosen = await prisma.user.upsert({
    where: { email: 'dosen@lms.com' },
    update: { nama: 'Dr. Ahmad Dosen', password: password, role: 'DOSEN' },
    create: {
      email: 'dosen@lms.com',
      nama: 'Dr. Ahmad Dosen',
      password: password,
      role: 'DOSEN',
    },
  });

  // Asisten
  await prisma.user.upsert({
    where: { email: 'asisten@lms.com' },
    update: { nama: 'Budi Asisten', password: password, role: 'ASISTEN' },
    create: {
      email: 'asisten@lms.com',
      nama: 'Budi Asisten',
      password: password,
      role: 'ASISTEN',
    },
  });

  // Mahasiswa Utama
  const mhs = await prisma.user.upsert({
    where: { email: 'mhs@lms.com' },
    update: { nama: 'Rizky Mahasiswa', password: password, role: 'MAHASISWA' },
    create: {
      email: 'mhs@lms.com',
      nama: 'Rizky Mahasiswa',
      password: password,
      role: 'MAHASISWA',
    },
  });

  // Mahasiswa Referral (Asep)
  const userAsep = await prisma.user.upsert({
    where: { email: 'asep@lms.com' },
    update: { nama: 'Asep Syarifudin', password: password, role: 'MAHASISWA' },
    create: {
      email: 'asep@lms.com',
      nama: 'Asep Syarifudin',
      password: password,
      role: 'MAHASISWA',
    },
  });

  // 2. Upsert 6 Mata Kuliah (Web Development Path)
  const coursesData = [
    { kode: 'WD-01', nama: 'HTML & CSS Dasar', level: 'Beginner', warna: '0', published: true, jumlahPertemuan: 14 },
    { kode: 'WD-02', nama: 'JavaScript Dasar', level: 'Beginner', warna: '299000', published: true, jumlahPertemuan: 14 },
    { kode: 'WD-03', nama: 'React JS Fundamental', level: 'Intermediate', warna: '499000', published: true, jumlahPertemuan: 14 },
    { kode: 'WD-04', nama: 'Node.js & API dev', level: 'Intermediate', warna: '399000', published: true, jumlahPertemuan: 14 },
    { kode: 'WD-05', nama: 'Database & ORM', level: 'Intermediate', warna: '299000', published: true, jumlahPertemuan: 14 },
    { kode: 'WD-06', nama: 'Full Stack Capstone', level: 'Advanced', warna: '599000', published: true, jumlahPertemuan: 14 }
  ];

  const dbCourses = [];
  for (const c of coursesData) {
    const mk = await prisma.mataKuliah.upsert({
      where: { kode: c.kode },
      update: {
        nama: c.nama,
        level: c.level,
        warna: c.warna,
        published: c.published,
        jumlahPertemuan: c.jumlahPertemuan,
      },
      create: {
        nama: c.nama,
        kode: c.kode,
        level: c.level,
        warna: c.warna,
        published: c.published,
        jumlahPertemuan: c.jumlahPertemuan,
        kapasitas: 50,
        kategori: 'Programming',
        statusPendaftaran: 'Aktif',
        tipeKursus: 'ONLINE',
        pengajarId: dosen.id
      }
    });
    dbCourses.push(mk);
  }

  // 3. Seed 3 Packages (Paket)
  // Web Dev Full Path (WD-01, WD-02, WD-03, WD-04, WD-05)
  const paket1 = await prisma.paket.create({
    data: {
      nama: 'Web Dev Full Path',
      deskripsi: 'Paket bundling pemrograman web terlengkap dari nol hingga mahir.',
      hargaPaket: '999000',
      hargaAsli: '1746000',
      courses: {
        connect: dbCourses.slice(0, 5).map(c => ({ id: c.id }))
      }
    }
  });

  // Front-End Specialist (WD-01, WD-02, WD-03)
  const paket2 = await prisma.paket.create({
    data: {
      nama: 'Front-End Specialist',
      deskripsi: 'Fokus menguasai pengembangan antarmuka web modern dengan React JS.',
      hargaPaket: '699000',
      hargaAsli: '1148000',
      courses: {
        connect: dbCourses.slice(0, 3).map(c => ({ id: c.id }))
      }
    }
  });

  // Back-End Engineer (WD-04, WD-05)
  const paket3 = await prisma.paket.create({
    data: {
      nama: 'Back-End Engineer',
      deskripsi: 'Fokus membangun REST API, manajemen database SQL/NoSQL, dan server scaling.',
      hargaPaket: '599000',
      hargaAsli: '698000',
      courses: {
        connect: dbCourses.slice(3, 5).map(c => ({ id: c.id }))
      }
    }
  });

  // 4. Seed Pendaftaran (Rizky Mahasiswa's own transactions)
  // Free Course
  await prisma.pendaftaran.create({
    data: {
      userId: mhs.id,
      mataKuliahId: dbCourses[0].id,
      harga: '0',
      invoiceNo: 'INV/20260625/MK/8820',
      method: 'Gratis',
      status: 'Lunas'
    }
  });

  // Paid Course
  await prisma.pendaftaran.create({
    data: {
      userId: mhs.id,
      mataKuliahId: dbCourses[1].id,
      harga: '299000',
      invoiceNo: 'INV/20260624/MK/4192',
      method: 'GoPay',
      status: 'Lunas'
    }
  });

  // Pending Course
  await prisma.pendaftaran.create({
    data: {
      userId: mhs.id,
      mataKuliahId: dbCourses[2].id,
      harga: '499000',
      invoiceNo: 'INV/20260620/MK/0129',
      method: 'Virtual Account BCA',
      status: 'Pending'
    }
  });

  // 5. Seed Referrals (Asep uses Rizky's referral code)
  // Rizky Mahasiswa's generated referral code is: LMS-RIZKYMAH-2026
  await prisma.pendaftaran.create({
    data: {
      userId: userAsep.id,
      mataKuliahId: dbCourses[0].id,
      referralCode: 'LMS-RIZKYMAH-2026',
      harga: '350000',
      invoiceNo: 'INV/REF/001',
      method: 'Virtual Account Mandiri',
      status: 'Lunas'
    }
  });

  await prisma.pendaftaran.create({
    data: {
      userId: userAsep.id,
      mataKuliahId: dbCourses[1].id,
      referralCode: 'LMS-RIZKYMAH-2026',
      harga: '350000',
      invoiceNo: 'INV/REF/002',
      method: 'Virtual Account Mandiri',
      status: 'Lunas'
    }
  });

  console.log('Seed data berhasil dimasukkan!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
