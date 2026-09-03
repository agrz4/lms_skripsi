const prisma = require('../config/db');
const { callOllama } = require('../services/ollamaService');
const { nilaiRefleksi } = require('../services/penilaianRefleksiService');
const { jalankanBerurutan, perkiraanTunggu } = require('../services/antrianAI');
const { cariMateriRelevan } = require('../services/materiRagService');


/**
 * POST /api/student/refleksi/submit
 * Mengirim jawaban esai refleksi mahasiswa dan memicu penilaian otomatis oleh AI lokal (Ollama).
 */
const submitRefleksi = async (req, res) => {
  const { pertemuanId, content } = req.body;
  const userId = req.user.id;

  if (!pertemuanId || !content) {
    return res.status(400).json({ 
      success: false, 
      message: 'pertemuanId dan content refleksi wajib diisi' 
    });
  }

  try {
    const pertemuan = await prisma.pertemuan.findUnique({
      where: { id: pertemuanId },
      include: { mataKuliah: true }
    });

    if (!pertemuan) {
      return res.status(404).json({ success: false, message: 'Pertemuan tidak ditemukan' });
    }

    // 1. Simpan submission dengan status awal (tanpa aiScore)
    const submission = await prisma.submission.upsert({
      where: {
        userId_pertemuanId_type: {
          userId,
          pertemuanId,
          type: 'REFLEKSI'
        }
      },
      update: {
        content,
        aiScore: null,
        feedback: 'Sedang diproses oleh AI...'
      },
      create: {
        userId,
        pertemuanId,
        type: 'REFLEKSI',
        content,
        aiScore: null,
        feedback: 'Sedang diproses oleh AI...'
      }
    });

    // 2. Jalankan AI di background, lewat antrian agar tidak berebut
    //    Ollama dengan proses indexing materi yang mungkin sedang jalan.
    setImmediate(() => {

      const tugas = jalankanBerurutan(`Refleksi: ${submission.id}`, async () => {

      // PENTING: dideklarasikan DI LUAR try.
      // Versi sebelumnya memakai "const aiRubrik" di dalam try, sehingga
      // variabel ini tidak terlihat dari blok catch. Setiap kali penilaian
      // AI gagal, blok catch ikut melempar ReferenceError, submission tidak
      // pernah ter-update, dan statusnya tertinggal di
      // "Sedang diproses oleh AI..." selamanya.
      let aiRubrik = null;

      try {
        // ================================================================
        // PENILAIAN BERBASIS PERTANYAAN + KUNCI JAWABAN
        //
        // Cara lama: prompt hanya berisi materi dan jawaban mahasiswa,
        // dinilai dengan rubrik generik (relevansi, pemahaman, analisis,
        // bahasa). Model tidak pernah tahu pertanyaan apa yang dijawab,
        // sehingga penilaiannya lebih menyerupai komentar kesesuaian
        // tulisan dengan materi.
        //
        // Cara baru: pertanyaan refleksi (kolom Materi.refleksi) dan
        // kunci jawaban hasil RAG dikirim ke model, lalu jawaban
        // mahasiswa diperiksa poin demi poin berdasarkan MAKNANYA.
        //
        // Seluruh logikanya ada di penilaianRefleksiService.
        // ================================================================

        const hasilPenilaian = await nilaiRefleksi({
          pertemuanId,
          jawabanMahasiswa: content
        });

        const aiScore = hasilPenilaian.score;

        aiRubrik = hasilPenilaian.aiRubrik;

        const aiFeedback = hasilPenilaian.feedbackText || "Feedback tidak tersedia.";

        // Catatan: normalisasi berdasarkan jumlah kata sengaja DIHAPUS.
        //
        // Aturan lama memaksa skor turun ke 45 bila jawaban di bawah 15
        // kata. Akibatnya jawaban singkat yang benar dan mencakup seluruh
        // poin kunci tetap dihukum, dan hasilnya terlihat seolah AI tidak
        // memahami makna. Kependekan jawaban kini tercermin secara wajar
        // pada aspek kualitas refleksi (maksimal 30 poin), bukan sebagai
        // pemotongan paksa.

        // Update submission
        await prisma.submission.update({
        where: {
          id: submission.id
        },
        data: {
          aiScore,
          aiRubrik,
          feedback: `[AI Grader]: ${aiFeedback}`
        }
      });

        console.log(`✅ AI grading selesai untuk submission ${submission.id}`);
        console.log(`   📊 Skor akhir: ${aiScore}, Feedback: ${aiFeedback.substring(0, 50)}...`);
      } catch (err) {

        console.error('❌ Background AI grading gagal:', err);

        // Tidak memberi skor tebakan saat AI gagal.
        //
        // Versi sebelumnya memberi nilai 60/75/85 berdasarkan panjang
        // karakter jawaban. Akibatnya mahasiswa bisa memperoleh 85 hanya
        // karena menulis panjang, tanpa AI menilai isinya sama sekali.
        // Untuk sistem penilaian semantik, angka seperti itu tidak dapat
        // dipertanggungjawabkan.
        //
        // aiScore dibiarkan null agar asisten tahu penilaian perlu diulang.
        try {
          await prisma.submission.update({
            where: { id: submission.id },
            data: {
              aiScore: null,
              aiRubrik,
              feedback: `[AI Grader]: Penilaian otomatis gagal (${err.message}). `
                + `Jawaban perlu dinilai manual atau diproses ulang.`
            }
          });
        } catch (updateErr) {
          console.error('❌ Gagal mencatat status kegagalan:', updateErr);
        }

        console.log('⚠️ Penilaian AI gagal, aiScore dibiarkan kosong.');
      }
      });

      // Beritahu mahasiswa posisi antreannya, supaya layar tunggu
      // tidak terasa seperti aplikasi yang macet. Ini penting saat
      // puluhan mahasiswa mengirim jawaban bersamaan.
      const posisi = tugas.posisiAntrean || 1;

      if (posisi > 1) {

        const perkiraanMenit = Math.ceil(perkiraanTunggu(posisi) / 60);

        prisma.submission.update({
          where: { id: submission.id },
          data: {
            feedback: `Sedang diproses oleh AI... (antrean ke-${posisi}, `
              + `perkiraan ${perkiraanMenit} menit)`
          }
        }).catch(() => { /* bukan hal kritis, abaikan bila gagal */ });
      }
    });

    // 3. Response CEPAT ke client (tanpa menunggu AI)
    return res.status(200).json({
      success: true,
      message: 'Refleksi berhasil dikirim, sedang diproses oleh AI. Hasil akan muncul sebentar lagi.',
      data: {
        id: submission.id,
        type: submission.type,
        content: submission.content,
        aiScore: null,
        feedback: 'Sedang diproses...',
      }
    });

  } catch (error) {
    console.error('Error submitting refleksi:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server saat submit refleksi' 
    });
  }
};

/**
 * POST /api/student/upload/tugas
 * Mengirim file tugas praktik mahasiswa (SCREENSHOT coding atau ZIP program).
 */
const uploadTugas = async (req, res) => {
  const { pertemuanId, type } = req.body;
  const userId = req.user.id;
  let fileUrl = req.body.fileUrl;

  if (req.file) {
    let subfolder = 'general';
    if (req.file.mimetype.startsWith('video/')) {
      subfolder = 'videos';
    } else if (req.file.mimetype === 'application/pdf' || req.file.mimetype.includes('document') || req.file.mimetype.includes('pdf')) {
      subfolder = 'documents';
    } else if (req.file.mimetype.startsWith('image/')) {
      subfolder = 'images';
    }
    fileUrl = `/public/uploads/${subfolder}/${req.file.filename}`;
  }

  if (!pertemuanId || !type || !fileUrl) {
    return res.status(400).json({ 
      success: false, 
      message: 'pertemuanId, type (SCREENSHOT/FILE_UPLOAD), dan file unggahan wajib diisi' 
    });
  }

  if (type !== 'SCREENSHOT' && type !== 'FILE_UPLOAD') {
    return res.status(400).json({ 
      success: false, 
      message: 'Type tugas harus berupa SCREENSHOT atau FILE_UPLOAD' 
    });
  }

  try {
    const submission = await prisma.submission.upsert({
      where: {
        userId_pertemuanId_type: {
          userId,
          pertemuanId,
          type
        }
      },
      update: {
        fileUrl,
        createdAt: new Date()
      },
      create: {
        userId,
        pertemuanId,
        type,
        fileUrl
      }
    });

    return res.status(200).json({
      success: true,
      message: `Tugas ${type.toLowerCase()} berhasil di-upload.`,
      data: submission
    });
  } catch (error) {
    console.error('Error uploading tugas:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server saat upload tugas' 
    });
  }
};

/**
 * POST /api/student/status/progres
 * Update status "Selesai" atau durasi tonton video pada pertemuan tertentu.
 */
const updateProgress = async (req, res) => {
  const { pertemuanId, watchedTime, isCompleted } = req.body;
  const userId = req.user.id;

  if (!pertemuanId) {
    return res.status(400).json({ success: false, message: 'pertemuanId wajib diisi' });
  }

  try {
    const progress = await prisma.studentProgress.upsert({
      where: {
        userId_pertemuanId: {
          userId,
          pertemuanId
        }
      },
      update: {
        watchedTime: watchedTime !== undefined ? watchedTime : undefined,
        isCompleted: isCompleted !== undefined ? isCompleted : undefined
      },
      create: {
        userId,
        pertemuanId,
        watchedTime: watchedTime || 0,
        isCompleted: isCompleted || false
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Progress belajar berhasil diperbarui.',
      data: progress
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server saat update progres' 
    });
  }
};

/**
 * GET /api/student/status/progres
 * Mengambil seluruh riwayat progress belajar siswa untuk memetakan checklist selesai (P1-P14).
 */
const getProgress = async (req, res) => {
  const userId = req.user.id;

  try {
    const progressList = await prisma.studentProgress.findMany({
      where: { userId },
      include: {
        pertemuan: true
      }
    });

    return res.status(200).json({
      success: true,
      data: progressList
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server saat mengambil progres' 
    });
  }
};

/**
 * GET /api/student/submissions
 * Mengambil tugas/refleksi yang sudah disubmit oleh mahasiswa untuk pertemuan tertentu.
 */
const getSubmissions = async (req, res) => {
  const userId = req.user.id;
  const { pertemuanId } = req.query;

  if (!pertemuanId) {
    return res.status(400).json({ success: false, message: 'pertemuanId wajib diisi' });
  }

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        pertemuanId
      }
    });

    return res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting submissions:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server saat mengambil submission'
    });
  }
};

/**
 * GET /api/student/course-summary/:courseId
 * Mengambil ringkasan nilai dan progress untuk satu kursus.
 */
const getCourseSummary = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ success: false, message: 'courseId wajib diisi' });
  }

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        pertemuan: {
          mataKuliahId: courseId
        }
      }
    });

    const refleksiSubmissions = submissions.filter(s => s.type === 'REFLEKSI');
    const avgRefleksi = refleksiSubmissions.length > 0
      ? (refleksiSubmissions.reduce((acc, curr) => acc + (curr.score !== null ? curr.score : (curr.aiScore || 0)), 0) / refleksiSubmissions.length)
      : 0;

    const tugasSubmissions = submissions.filter(s => s.type === 'SCREENSHOT' || s.type === 'FILE_UPLOAD');
    const avgTugas = tugasSubmissions.length > 0
      ? (tugasSubmissions.reduce((acc, curr) => acc + (curr.score !== null ? curr.score : (curr.aiScore || 0)), 0) / tugasSubmissions.length)
      : 0;

    const completedProgress = await prisma.studentProgress.count({
      where: {
        userId,
        pertemuan: {
          mataKuliahId: courseId
        },
        isCompleted: true
      }
    });

    const course = await prisma.mataKuliah.findUnique({
      where: { id: courseId },
      select: { jumlahPertemuan: true }
    });
    const totalMeetings = course ? course.jumlahPertemuan : 14;

    const ujian = await prisma.ujian.findUnique({
      where: { mataKuliahId: courseId }
    });
    
    let examScore = null;
    if (ujian) {
      const submissionUjian = await prisma.ujianSubmission.findUnique({
        where: {
          userId_ujianId: {
            userId,
            ujianId: ujian.id
          }
        }
      });
      if (submissionUjian) {
        examScore = submissionUjian.score;
      }
    }

    return res.status(200).json({
      success: true,
      avgRefleksi: Math.round(avgRefleksi * 10) / 10,
      avgTugas: Math.round(avgTugas * 10) / 10,
      completedMeetings: completedProgress,
      totalMeetings: totalMeetings,
      examScore
    });
  } catch (error) {
    console.error('Error in getCourseSummary:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { submitRefleksi, uploadTugas, updateProgress, getProgress, getSubmissions, getCourseSummary };