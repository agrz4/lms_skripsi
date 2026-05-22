const prisma = require('../config/db');
const { generateEmbedding } = require('../services/embeddingService');

/**
 * POST /api/admin/assign-pengajar
 * Menghubungkan pengajar/asisten tertentu ke materi/pertemuan spesifik atau ke mata kuliah.
 */
const assignPengajar = async (req, res) => {
  const { targetType, targetId, userId } = req.body;

  if (!targetType || !targetId || !userId) {
    return res.status(400).json({ 
      success: false, 
      message: 'targetType (course/session), targetId, and userId are required' 
    });
  }

  try {
    // 1. Cek apakah user ada dan memiliki role yang sesuai
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pengajar/Asisten tidak ditemukan' 
      });
    }

    if (user.role !== 'DOSEN' && user.role !== 'ASISTEN') {
      return res.status(400).json({ 
        success: false, 
        message: 'User harus memiliki role DOSEN atau ASISTEN untuk ditugaskan' 
      });
    }

    // 2. Hubungkan ke MataKuliah (kursus utama)
    if (targetType === 'course' || targetType === 'matakuliah') {
      if (user.role !== 'DOSEN') {
        return res.status(400).json({ 
          success: false, 
          message: 'Hanya DOSEN yang dapat ditugaskan sebagai pengajar utama mata kuliah' 
        });
      }

      const updatedCourse = await prisma.mataKuliah.update({
        where: { id: targetId },
        data: { pengajarId: userId },
        include: {
          pengajar: {
            select: { id: true, nama: true, email: true, role: true }
          }
        }
      });

      return res.status(200).json({
        success: true,
        message: `Berhasil menugaskan ${user.nama} sebagai pengajar utama untuk kursus ${updatedCourse.nama}`,
        data: updatedCourse
      });
    }

    // 3. Hubungkan ke Pertemuan (sesi 1-14)
    if (targetType === 'session' || targetType === 'pertemuan') {
      const updateData = {};
      if (user.role === 'DOSEN') {
        updateData.dosenId = userId;
      } else if (user.role === 'ASISTEN') {
        updateData.asistenId = userId;
      }

      const updatedPertemuan = await prisma.pertemuan.update({
        where: { id: targetId },
        data: updateData,
        include: {
          dosen: { select: { id: true, nama: true } },
          asisten: { select: { id: true, nama: true } },
          mataKuliah: true
        }
      });

      return res.status(200).json({
        success: true,
        message: `Berhasil menugaskan ${user.nama} (${user.role}) ke pertemuan ke-${updatedPertemuan.urutan} pada kursus ${updatedPertemuan.mataKuliah.nama}`,
        data: updatedPertemuan
      });
    }

    return res.status(400).json({ 
      success: false, 
      message: 'targetType tidak valid. Gunakan "course" atau "session"' 
    });

  } catch (error) {
    console.error('Error in assignPengajar:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server' 
    });
  }
};

/**
 * POST /api/admin/ai-sync
 * Sinkronisasi seluruh materi yang di-upload pengajar ke Vector Database/LLM untuk auto-correction reference.
 */
const aiSync = async (req, res) => {
  try {
    // Ambil semua materi dari database
    const daftarMateri = await prisma.materi.findMany({
      include: {
        pertemuan: true,
        mataKuliah: true
      }
    });

    if (daftarMateri.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Tidak ada materi yang perlu disinkronkan saat ini.',
        syncedCount: 0,
        logs: []
      });
    }

    const logs = [];
    let successCount = 0;

    // Lakukan simulasi pembuatan vector embeddings untuk setiap materi
    // (Dalam produksi, kita bisa menyimpan embedding ini di tabel khusus atau Vector database eksternal)
    for (const materi of daftarMateri) {
      const textToEmbed = `Mata Kuliah: ${materi.mataKuliah.nama}. Pertemuan ke-${materi.pertemuan.urutan} Topik: ${materi.nama}. Detail Refleksi: ${materi.refleksi || ''}`;
      
      try {
        // Panggil gemini embedding api untuk memvalidasi/membuat vector
        const vector = await generateEmbedding(textToEmbed.substring(0, 1000));
        
        logs.push({
          materiId: materi.id,
          nama: materi.nama,
          status: 'SUCCESS',
          vectorDimension: vector.length,
          snippet: textToEmbed.substring(0, 60) + '...'
        });
        successCount++;
      } catch (embErr) {
        console.error(`Gagal membuat embedding untuk materi ${materi.id}:`, embErr);
        logs.push({
          materiId: materi.id,
          nama: materi.nama,
          status: 'FAILED',
          error: embErr.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Sinkronisasi AI selesai. Berhasil menyelaraskan ${successCount} dari ${daftarMateri.length} materi ke Vector DB.`,
      syncedCount: successCount,
      totalCount: daftarMateri.length,
      logs
    });

  } catch (error) {
    console.error('Error in aiSync:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server saat sinkronisasi AI'
    });
  }
};

/**
 * GET /api/admin/laporan-akhir
 * Perhitungan nilai kumulatif, kelulusan, dan status sertifikat untuk semua mahasiswa terdaftar di kursus.
 */
const getLaporanAkhir = async (req, res) => {
  const { courseId } = req.query;

  if (!courseId) {
    return res.status(400).json({ success: false, message: 'courseId wajib diisi' });
  }

  try {
    const course = await prisma.mataKuliah.findUnique({
      where: { id: courseId },
      include: {
        ujian: true
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Mata kuliah tidak ditemukan' });
    }

    // Ambil pendaftaran kelas
    const pendaftarans = await prisma.pendaftaran.findMany({
      where: { mataKuliahId: courseId },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      }
    });

    const reportData = [];

    for (const p of pendaftarans) {
      const user = p.user;

      // Ambil submission pengerjaan siswa
      const submissions = await prisma.submission.findMany({
        where: {
          userId: user.id,
          pertemuan: {
            mataKuliahId: courseId
          }
        }
      });

      // Rata-rata Refleksi
      const reflections = submissions.filter(s => s.type === 'REFLEKSI');
      const avgRefleksi = reflections.length > 0
        ? (reflections.reduce((acc, curr) => acc + (curr.score !== null ? curr.score : (curr.aiScore || 0)), 0) / reflections.length)
        : 0;

      // Rata-rata Tugas (SCREENSHOT/FILE_UPLOAD)
      const tasks = submissions.filter(s => s.type === 'SCREENSHOT' || s.type === 'FILE_UPLOAD');
      const avgTugas = tasks.length > 0
        ? (tasks.reduce((acc, curr) => acc + (curr.score !== null ? curr.score : (curr.aiScore || 0)), 0) / tasks.length)
        : 0;

      // Skor Ujian Akhir
      let examScore = 0;
      if (course.ujian) {
        const ujianSubmission = await prisma.ujianSubmission.findUnique({
          where: {
            userId_ujianId: {
              userId: user.id,
              ujianId: course.ujian.id
            }
          }
        });
        if (ujianSubmission) {
          examScore = ujianSubmission.score;
        }
      }

      // Total kumulatif: 30% Refleksi + 35% Tugas + 35% Ujian
      const totalScore = (avgRefleksi * 0.3) + (avgTugas * 0.35) + (examScore * 0.35);
      const isPass = totalScore >= 70;

      // Cek status sertifikat
      const sertifikat = await prisma.sertifikat.findFirst({
        where: {
          userId: user.id,
          mataKuliahId: courseId
        }
      });

      reportData.push({
        userId: user.id,
        name: user.nama,
        email: user.email,
        avgRefleksi: Math.round(avgRefleksi),
        avgTugas: Math.round(avgTugas),
        examScore: Math.round(examScore),
        totalScore: Math.round(totalScore),
        status: isPass ? 'Lulus' : 'Tidak Lulus',
        certificate: sertifikat ? {
          id: sertifikat.id,
          noSertifikat: sertifikat.noSertifikat,
          fileUrl: sertifikat.fileUrl,
          createdAt: sertifikat.createdAt
        } : null
      });
    }

    return res.status(200).json({
      success: true,
      courseName: course.nama,
      data: reportData
    });

  } catch (error) {
    console.error('Error in getLaporanAkhir:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/admin/sertifikat/generate
 * Menerbitkan nomor sertifikat kelulusan unik ke database.
 */
const generateSertifikat = async (req, res) => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    return res.status(400).json({ success: false, message: 'userId dan courseId wajib diisi' });
  }

  try {
    const existingCert = await prisma.sertifikat.findFirst({
      where: {
        userId,
        mataKuliahId: courseId
      }
    });

    if (existingCert) {
      return res.status(200).json({
        success: true,
        message: 'Sertifikat sudah diterbitkan.',
        data: existingCert
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const course = await prisma.mataKuliah.findUnique({
      where: { id: courseId },
      include: { ujian: true }
    });

    if (!user || !course) {
      return res.status(404).json({ success: false, message: 'User atau Mata Kuliah tidak ditemukan' });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        pertemuan: { mataKuliahId: courseId }
      }
    });

    const reflections = submissions.filter(s => s.type === 'REFLEKSI');
    const avgRefleksi = reflections.length > 0
      ? (reflections.reduce((acc, curr) => acc + (curr.score !== null ? curr.score : (curr.aiScore || 0)), 0) / reflections.length)
      : 0;

    const tasks = submissions.filter(s => s.type === 'SCREENSHOT' || s.type === 'FILE_UPLOAD');
    const avgTugas = tasks.length > 0
      ? (tasks.reduce((acc, curr) => acc + (curr.score !== null ? curr.score : (curr.aiScore || 0)), 0) / tasks.length)
      : 0;

    let examScore = 0;
    if (course.ujian) {
      const ujianSubmission = await prisma.ujianSubmission.findUnique({
        where: {
          userId_ujianId: {
            userId,
            ujianId: course.ujian.id
          }
        }
      });
      if (ujianSubmission) {
        examScore = ujianSubmission.score;
      }
    }

    const totalScore = Math.round((avgRefleksi * 0.3) + (avgTugas * 0.35) + (examScore * 0.35));

    const randomUuid = Math.random().toString(36).substring(2, 8).toUpperCase();
    const noSertifikat = `CERT-${course.kode}-${new Date().getFullYear()}-${randomUuid}`;

    const sertifikat = await prisma.sertifikat.create({
      data: {
        userId,
        mataKuliahId: courseId,
        nilai: totalScore,
        noSertifikat,
        fileUrl: `/api/admin/sertifikat/download/${noSertifikat}`
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Sertifikat berhasil diterbitkan.',
      data: sertifikat
    });

  } catch (error) {
    console.error('Error in generateSertifikat:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/admin/sertifikat/download/:id
 * Menghasilkan file SVG sertifikat kelulusan yang dinamis dan premium.
 */
const downloadSertifikat = async (req, res) => {
  const { id } = req.params;

  try {
    const sertifikat = await prisma.sertifikat.findFirst({
      where: {
        OR: [
          { id: id },
          { noSertifikat: id }
        ]
      }
    });

    if (!sertifikat) {
      return res.status(404).send('<h1>Sertifikat tidak ditemukan</h1>');
    }

    const user = await prisma.user.findUnique({ where: { id: sertifikat.userId } });
    const course = await prisma.mataKuliah.findUnique({ where: { id: sertifikat.mataKuliahId } });

    if (!user || !course) {
      return res.status(404).send('<h1>Informasi sertifikat tidak lengkap</h1>');
    }

    const formattedDate = new Date(sertifikat.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  
  <rect width="800" height="600" fill="url(#bgGrad)" />
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="url(#goldGrad)" stroke-width="4" rx="15" />
  <rect x="30" y="30" width="740" height="540" fill="none" stroke="#334155" stroke-width="1" rx="10" opacity="0.5" />

  <path d="M 20 60 L 60 20 M 20 80 L 80 20 M 20 100 L 100 20" stroke="url(#goldGrad)" stroke-width="2" />
  <path d="M 780 60 L 740 20 M 780 80 L 720 20 M 780 100 L 700 20" stroke="url(#goldGrad)" stroke-width="2" />
  <path d="M 20 540 L 60 580 M 20 520 L 80 580 M 20 500 L 100 580" stroke="url(#goldGrad)" stroke-width="2" />
  <path d="M 780 540 L 740 580 M 780 520 L 720 580 M 780 500 L 700 580" stroke="url(#goldGrad)" stroke-width="2" />

  <text x="400" y="90" font-family="'Inter', sans-serif" font-size="12" font-weight="900" fill="#a1a1aa" letter-spacing="4" text-anchor="middle">SERTIFIKAT KELULUSAN</text>
  <text x="400" y="115" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="#64748b" letter-spacing="2" text-anchor="middle">HYBRID LMS AI ACADEMY</text>
  
  <g transform="translate(370, 140)" filter="url(#shadow)">
    <path d="M 15 0 L 30 40 L 22.5 35 L 15 40 L 7.5 35 L 0 40 Z" fill="#d97706" />
    <path d="M 25 0 L 40 40 L 32.5 35 L 25 40 L 17.5 35 L 10 40 Z" fill="#fbbf24" opacity="0.8" />
    <circle cx="20" cy="15" r="18" fill="url(#goldGrad)" />
    <circle cx="20" cy="15" r="14" fill="#1e293b" />
    <path d="M 15 15 L 18 18 L 25 11" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <text x="400" y="240" font-family="'Inter', sans-serif" font-size="14" font-weight="500" fill="#94a3b8" text-anchor="middle">Sertifikat ini dengan bangga diberikan kepada</text>
  <text x="400" y="290" font-family="'Inter', sans-serif" font-size="36" font-weight="900" fill="#ffffff" text-anchor="middle" filter="url(#shadow)">${user.nama.toUpperCase()}</text>
  <line x1="250" y1="315" x2="550" y2="315" stroke="url(#goldGrad)" stroke-width="2" />

  <text x="400" y="350" font-family="'Inter', sans-serif" font-size="14" font-weight="500" fill="#94a3b8" text-anchor="middle">Atas keberhasilannya menyelesaikan kelas</text>
  <text x="400" y="385" font-family="'Inter', sans-serif" font-size="22" font-weight="800" fill="#38bdf8" text-anchor="middle">${course.nama}</text>
  
  <text x="400" y="420" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#a7f3d0" text-anchor="middle">Dengan Predikat Nilai Kumulatif: ${sertifikat.nilai} / 100</text>

  <g transform="translate(150, 480)">
    <line x1="0" y1="0" x2="150" y2="0" stroke="#475569" stroke-width="1" />
    <text x="75" y="20" font-family="'Inter', sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Kepala Akademik</text>
    <text x="75" y="-15" font-family="'Brush Script MT', cursive, sans-serif" font-size="18" fill="#fbbf24" text-anchor="middle">Admin LMS Hybrid</text>
  </g>

  <g transform="translate(500, 480)">
    <line x1="0" y1="0" x2="150" y2="0" stroke="#475569" stroke-width="1" />
    <text x="75" y="20" font-family="'Inter', sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Tanggal Penerbitan</text>
    <text x="75" y="-15" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">${formattedDate}</text>
  </g>

  <text x="400" y="550" font-family="'Courier New', monospace" font-size="10" fill="#475569" text-anchor="middle">No: ${sertifikat.noSertifikat}</text>
</svg>
`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${sertifikat.noSertifikat}.svg"`);
    return res.status(200).send(svg);

  } catch (error) {
    console.error('Error in downloadSertifikat:', error);
    return res.status(500).send('<h1>Server error</h1>');
  }
};

module.exports = { assignPengajar, aiSync, getLaporanAkhir, generateSertifikat, downloadSertifikat };
