const prisma = require('../config/db');
const { GoogleGenAI } = require('@google/genai');

// Inisialisasi Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * POST /api/student/refleksi/submit
 * Mengirim jawaban esai refleksi mahasiswa dan memicu penilaian otomatis oleh AI Gemini.
 */
const submitRefleksi = async (req, res) => {
  const { pertemuanId, content } = req.body;
  const userId = req.user.id; // Diperoleh dari authMiddleware

  if (!pertemuanId || !content) {
    return res.status(400).json({ 
      success: false, 
      message: 'pertemuanId dan content refleksi wajib diisi' 
    });
  }

  try {
    // 1. Ambil detail pertemuan untuk topik/konteks prompt AI
    const pertemuan = await prisma.pertemuan.findUnique({
      where: { id: pertemuanId },
      include: { mataKuliah: true }
    });

    if (!pertemuan) {
      return res.status(404).json({ success: false, message: 'Pertemuan tidak ditemukan' });
    }

    // 2. Gunakan AI Gemini untuk melakukan scoring otomatis (referensi AI)
    let aiScore = 75; // Default score jika terjadi error AI
    let aiFeedback = "Telah disubmit dengan sukses. Menunggu penilaian manual asisten.";

    try {
      const prompt = `Anda adalah Asisten Dosen AI untuk Mata Kuliah "${pertemuan.mataKuliah.nama}".
Tugas Anda adalah menilai jawaban esai refleksi mahasiswa untuk pertemuan dengan topik: "${pertemuan.topik || 'Pengenalan'}".

Jawaban Refleksi Mahasiswa:
"${content}"

Berikan penilaian objektif dalam bentuk skor angka antara 0 sampai 100 dan berikan feedback singkat maksimal 2 kalimat.
Format respon WAJIB berupa JSON valid murni (tanpa tag markdown \`\`\`json) dengan struktur sebagai berikut:
{
  "score": 85,
  "feedback": "Penjelasan Anda mengenai topik sangat baik dan menyentuh inti materi pelajaran."
}
`;

      const response = await ai.models.generateContent({
        model: 'models/gemini-flash-latest',
        contents: [{ parts: [{ text: prompt }] }],
      });

      const responseText = response.text.trim();
      // Bersihkan kemungkinan tag markdown json dari response
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const aiResult = JSON.parse(cleanJson);
      
      if (aiResult && typeof aiResult.score === 'number') {
        aiScore = aiResult.score;
        aiFeedback = aiResult.feedback;
      }
    } catch (aiErr) {
      console.error('Gagal memproses penilaian AI Gemini:', aiErr);
      // Fallback ke model simple heuristic jika API gagal
      if (content.length > 100) aiScore = 85;
      else if (content.length > 50) aiScore = 75;
      else aiScore = 60;
    }

    // 3. Simpan atau Update submission tipe REFLEKSI di database
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
        aiScore,
        feedback: `[AI Grader]: ${aiFeedback}`
      },
      create: {
        userId,
        pertemuanId,
        type: 'REFLEKSI',
        content,
        aiScore,
        feedback: `[AI Grader]: ${aiFeedback}`
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Refleksi berhasil disubmit dan dinilai otomatis oleh AI.',
      data: submission
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

  // Jika ada file yang diunggah secara riil
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
    // Simpan ke database
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

const getCourseSummary = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ success: false, message: 'courseId wajib diisi' });
  }

  try {
    // 1. Get all submissions of this user in this course
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

    // 2. Get progress completed count
    const completedProgress = await prisma.studentProgress.count({
      where: {
        userId,
        pertemuan: {
          mataKuliahId: courseId
        },
        isCompleted: true
      }
    });

    // 3. Get total meetings configuration
    const countPertemuan = await prisma.pertemuan.count({
      where: { mataKuliahId: courseId }
    });

    const course = await prisma.mataKuliah.findUnique({
      where: { id: courseId },
      select: { jumlahPertemuan: true }
    });
    const totalMeetings = countPertemuan > 0 ? countPertemuan : (course ? course.jumlahPertemuan : 14);

    // 4. Get exam status / score if any
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
