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
    update: { nama: 'Rizky Mahasiswa', password: password, role: 'MAHASISWA', noWhatsapp: '081234567890' },
    create: {
      email: 'mhs@lms.com',
      nama: 'Rizky Mahasiswa',
      password: password,
      role: 'MAHASISWA',
      noWhatsapp: '081234567890',
    },
  });

  // Mahasiswa Referral (Asep)
  const userAsep = await prisma.user.upsert({
    where: { email: 'asep@lms.com' },
    update: { nama: 'Asep Syarifudin', password: password, role: 'MAHASISWA', noWhatsapp: '089876543210' },
    create: {
      email: 'asep@lms.com',
      nama: 'Asep Syarifudin',
      password: password,
      role: 'MAHASISWA',
      noWhatsapp: '089876543210',
    },
  });

  // 2. Upsert Mata Kuliah (Comprehensive Paths)
  const coursesData = [
    // Web Development Path
    { kode: 'WD-01', nama: 'HTML & CSS Dasar', level: 'Beginner', warna: '0', published: true, jumlahPertemuan: 3, kategori: 'Programming' },
    { kode: 'WD-02', nama: 'JavaScript Dasar', level: 'Beginner', warna: '299000', published: true, jumlahPertemuan: 3, kategori: 'Programming' },
    { kode: 'WD-03', nama: 'React JS Fundamental', level: 'Intermediate', warna: '499000', published: true, jumlahPertemuan: 3, kategori: 'Programming' },
    { kode: 'WD-04', nama: 'Node.js & API dev', level: 'Intermediate', warna: '399000', published: true, jumlahPertemuan: 3, kategori: 'Programming' },
    { kode: 'WD-05', nama: 'Database & ORM', level: 'Intermediate', warna: '299000', published: true, jumlahPertemuan: 3, kategori: 'Programming' },
    { kode: 'WD-06', nama: 'Full Stack Capstone', level: 'Advanced', warna: '599000', published: true, jumlahPertemuan: 3, kategori: 'Programming' },

    // Data Science Path
    { kode: 'DS-01', nama: 'Pengantar Data Science', level: 'Beginner', warna: '0', published: true, jumlahPertemuan: 3, kategori: 'Data Science' },
    { kode: 'DS-02', nama: 'Statistik & Probabilitas', level: 'Beginner', warna: '199000', published: true, jumlahPertemuan: 3, kategori: 'Data Science' },
    { kode: 'DS-03', nama: 'Pemrograman Python untuk Data Science', level: 'Intermediate', warna: '349000', published: true, jumlahPertemuan: 3, kategori: 'Data Science' },
    { kode: 'DS-04', nama: 'Analisis Data & Visualisasi', level: 'Intermediate', warna: '299000', published: true, jumlahPertemuan: 3, kategori: 'Data Science' },
    { kode: 'DS-05', nama: 'Machine Learning Dasar', level: 'Advanced', warna: '499000', published: true, jumlahPertemuan: 3, kategori: 'Data Science' },

    // Cyber Security Path
    { kode: 'CS-01', nama: 'Dasar Jaringan & Sistem Operasi', level: 'Beginner', warna: '0', published: true, jumlahPertemuan: 3, kategori: 'Cyber Security' },
    { kode: 'CS-02', nama: 'Keamanan Informasi & Kriptografi', level: 'Beginner', warna: '249000', published: true, jumlahPertemuan: 3, kategori: 'Cyber Security' },
    { kode: 'CS-03', nama: 'Ethical Hacking Dasar', level: 'Intermediate', warna: '399000', published: true, jumlahPertemuan: 3, kategori: 'Cyber Security' },
    { kode: 'CS-04', nama: 'Analisis Malware & Forensik', level: 'Advanced', warna: '499000', published: true, jumlahPertemuan: 3, kategori: 'Cyber Security' },

    // UI/UX Design Path
    { kode: 'UI-01', nama: 'Dasar Desain Grafis', level: 'Beginner', warna: '0', published: true, jumlahPertemuan: 3, kategori: 'Design' },
    { kode: 'UI-02', nama: 'User Research & Wireframing', level: 'Beginner', warna: '199000', published: true, jumlahPertemuan: 3, kategori: 'Design' },
    { kode: 'UI-03', nama: 'Visual Design & Prototyping (Figma)', level: 'Intermediate', warna: '399000', published: true, jumlahPertemuan: 3, kategori: 'Design' },
    { kode: 'UI-04', nama: 'Design System & Handover', level: 'Advanced', warna: '299000', published: true, jumlahPertemuan: 3, kategori: 'Design' },

    // AI Fundamentals Path
    { kode: 'AI-01', nama: 'Matematika untuk AI', level: 'Beginner', warna: '0', published: true, jumlahPertemuan: 3, kategori: 'AI' },
    { kode: 'AI-02', nama: 'Pengantar Kecerdasan Buatan', level: 'Beginner', warna: '249000', published: true, jumlahPertemuan: 3, kategori: 'AI' },
    { kode: 'AI-03', nama: 'Deep Learning & Jaringan Saraf', level: 'Intermediate', warna: '449000', published: true, jumlahPertemuan: 3, kategori: 'AI' },
    { kode: 'AI-04', nama: 'NLP & Computer Vision', level: 'Advanced', warna: '499000', published: true, jumlahPertemuan: 3, kategori: 'AI' }
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
        kategori: c.kategori,
      },
      create: {
        nama: c.nama,
        kode: c.kode,
        level: c.level,
        warna: c.warna,
        published: c.published,
        jumlahPertemuan: c.jumlahPertemuan,
        kapasitas: 50,
        kategori: c.kategori,
        statusPendaftaran: 'Aktif',
        tipeKursus: 'ONLINE',
        pengajarId: dosen.id
      }
    });
    dbCourses.push(mk);
  }

  const getCourseId = (kode) => {
    const course = dbCourses.find(c => c.kode === kode);
    return course ? course.id : null;
  };

  console.log('Menghubungkan prasyarat (prerequisites) mata kuliah...');
  
  // Web Dev Path
  await prisma.mataKuliah.update({
    where: { id: getCourseId('WD-02') },
    data: { prerequisites: { set: [{ id: getCourseId('WD-01') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('WD-03') },
    data: { prerequisites: { set: [{ id: getCourseId('WD-02') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('WD-04') },
    data: { prerequisites: { set: [{ id: getCourseId('WD-02') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('WD-05') },
    data: { prerequisites: { set: [{ id: getCourseId('WD-04') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('WD-06') },
    data: { prerequisites: { set: [{ id: getCourseId('WD-03') }, { id: getCourseId('WD-05') }] } }
  });

  // Data Science Path
  await prisma.mataKuliah.update({
    where: { id: getCourseId('DS-02') },
    data: { prerequisites: { set: [{ id: getCourseId('DS-01') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('DS-03') },
    data: { prerequisites: { set: [{ id: getCourseId('DS-01') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('DS-04') },
    data: { prerequisites: { set: [{ id: getCourseId('DS-02') }, { id: getCourseId('DS-03') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('DS-05') },
    data: { prerequisites: { set: [{ id: getCourseId('DS-04') }] } }
  });

  // Cyber Security Path
  await prisma.mataKuliah.update({
    where: { id: getCourseId('CS-02') },
    data: { prerequisites: { set: [{ id: getCourseId('CS-01') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('CS-03') },
    data: { prerequisites: { set: [{ id: getCourseId('CS-02') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('CS-04') },
    data: { prerequisites: { set: [{ id: getCourseId('CS-03') }] } }
  });

  // UI/UX Design Path
  await prisma.mataKuliah.update({
    where: { id: getCourseId('UI-02') },
    data: { prerequisites: { set: [{ id: getCourseId('UI-01') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('UI-03') },
    data: { prerequisites: { set: [{ id: getCourseId('UI-02') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('UI-04') },
    data: { prerequisites: { set: [{ id: getCourseId('UI-03') }] } }
  });

  // AI Fundamentals Path
  await prisma.mataKuliah.update({
    where: { id: getCourseId('AI-02') },
    data: { prerequisites: { set: [{ id: getCourseId('AI-01') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('AI-03') },
    data: { prerequisites: { set: [{ id: getCourseId('AI-02') }] } }
  });
  await prisma.mataKuliah.update({
    where: { id: getCourseId('AI-04') },
    data: { prerequisites: { set: [{ id: getCourseId('AI-03') }] } }
  });

  // 3. Seed Packages (Paket)
  // Web Dev Full Path (WD-01, WD-02, WD-03, WD-04, WD-05)
  await prisma.paket.create({
    data: {
      nama: 'Web Dev Full Path',
      deskripsi: 'Paket bundling pemrograman web terlengkap dari nol hingga mahir.',
      hargaPaket: '999000',
      hargaAsli: '1746000',
      courses: {
        connect: ['WD-01', 'WD-02', 'WD-03', 'WD-04', 'WD-05'].map(kode => ({ id: getCourseId(kode) }))
      }
    }
  });

  // Front-End Specialist (WD-01, WD-02, WD-03)
  await prisma.paket.create({
    data: {
      nama: 'Front-End Specialist',
      deskripsi: 'Fokus menguasai pengembangan antarmuka web modern dengan React JS.',
      hargaPaket: '699000',
      hargaAsli: '1148000',
      courses: {
        connect: ['WD-01', 'WD-02', 'WD-03'].map(kode => ({ id: getCourseId(kode) }))
      }
    }
  });

  // Back-End Engineer (WD-04, WD-05)
  await prisma.paket.create({
    data: {
      nama: 'Back-End Engineer',
      deskripsi: 'Fokus membangun REST API, manajemen database SQL/NoSQL, dan server scaling.',
      hargaPaket: '599000',
      hargaAsli: '698000',
      courses: {
        connect: ['WD-04', 'WD-05'].map(kode => ({ id: getCourseId(kode) }))
      }
    }
  });

  // Data Science Track
  await prisma.paket.create({
    data: {
      nama: 'Data Science Track',
      deskripsi: 'Kuasai analisis data, statistik, dan machine learning menggunakan Python.',
      hargaPaket: '899000',
      hargaAsli: '1346000',
      courses: {
        connect: ['DS-01', 'DS-02', 'DS-03', 'DS-04', 'DS-05'].map(kode => ({ id: getCourseId(kode) }))
      }
    }
  });

  // Cyber Security Path
  await prisma.paket.create({
    data: {
      nama: 'Cyber Security Path',
      deskripsi: 'Belajar ethical hacking, keamanan informasi, dan forensik digital.',
      hargaPaket: '799000',
      hargaAsli: '1147000',
      courses: {
        connect: ['CS-01', 'CS-02', 'CS-03', 'CS-04'].map(kode => ({ id: getCourseId(kode) }))
      }
    }
  });

  // UI/UX Design Track
  await prisma.paket.create({
    data: {
      nama: 'UI/UX Design Track',
      deskripsi: 'Pelajari riset pengguna, wireframing, dan visual design interaktif.',
      hargaPaket: '699000',
      hargaAsli: '888000',
      courses: {
        connect: ['UI-01', 'UI-02', 'UI-03', 'UI-04'].map(kode => ({ id: getCourseId(kode) }))
      }
    }
  });

  // AI Fundamentals Track
  await prisma.paket.create({
    data: {
      nama: 'AI Fundamentals Track',
      deskripsi: 'Pahami matematika AI, deep learning, NLP, dan computer vision.',
      hargaPaket: '899000',
      hargaAsli: '1147000',
      courses: {
        connect: ['AI-01', 'AI-02', 'AI-03', 'AI-04'].map(kode => ({ id: getCourseId(kode) }))
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
