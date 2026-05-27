const { evaluasiSoal } = require('../services/evaluasiService');
const { indexSoal } = require('../services/ragService');
const prisma = require('../config/db');

/**
 * POST /api/ai/evaluasi
 * Mengevaluasi kualitas soal menggunakan RAG
 */
const evaluasiSoalHandler = async (req, res) => {
  try {
    const { soalId, pertanyaan, mataKuliahId, mataKuliahNama, tipeSoal } = req.body;

    if (!pertanyaan || !mataKuliahId) {
      return res.status(400).json({
        success: false,
        message: 'Field pertanyaan dan mataKuliahId wajib diisi',
      });
    }

    // Jalankan evaluasi RAG
    const hasil = await evaluasiSoal(pertanyaan, mataKuliahNama, tipeSoal, mataKuliahId);

    // Simpan hasil evaluasi ke database
    if (soalId) {
      await prisma.evaluasi.create({
        data: {
          soalId,
          skorKualitas: hasil.skorKualitas,
          tingkatKesulitan: hasil.tingkatKesulitan,
          isDuplikat: hasil.isDuplikat,
          saranPerbaikan: hasil.saranPerbaikan,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: hasil,
    });
  } catch (error) {
    console.error('Error controller evaluasi:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server',
    });
  }
};

/**
 * POST /api/ai/index
 * Menyimpan soal ke vector database untuk keperluan RAG
 */
const indexSoalHandler = async (req, res) => {
  try {
    const { soalId, pertanyaan, mataKuliahId, tipeSoal } = req.body;

    if (!soalId || !pertanyaan || !mataKuliahId) {
      return res.status(400).json({
        success: false,
        message: 'Field soalId, pertanyaan, dan mataKuliahId wajib diisi',
      });
    }

    await indexSoal(soalId, pertanyaan, mataKuliahId, { tipeSoal });

    return res.status(200).json({
      success: true,
      message: 'Soal berhasil diindeks ke vector database',
    });
  } catch (error) {
    console.error('Error controller index:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server',
    });
  }
};

const getStatsPGHandler = async (req, res) => {
  try {
    // Ambil data pengerjaan ujian/latihan pilihan ganda dari UjianSubmission
    const submissions = await prisma.ujianSubmission.findMany({
      include: {
        user: { select: { id: true, nama: true, email: true } },
        ujian: {
          include: {
            mataKuliah: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalSubmissions = submissions.length;
    const scores = submissions.map(s => s.score || 0);
    const avgScore = totalSubmissions > 0 
      ? (scores.reduce((sum, val) => sum + val, 0) / totalSubmissions) 
      : 0;

    let distribution = {
      perfect: 0,
      excellent: 0,
      good: 0,
      poor: 0
    };

    scores.forEach(score => {
      if (score === 100) distribution.perfect++;
      else if (score >= 80) distribution.excellent++;
      else if (score >= 60) distribution.good++;
      else distribution.poor++;
    });

    // Sesuaikan format data agar kompatibel dengan yang diharapkan frontend
    const formattedSubmissions = submissions.map(sub => {
      return {
        id: sub.id,
        user: sub.user,
        pertemuan: {
          urutan: 'UAS',
          topik: 'Ujian Akhir Semester',
          mataKuliah: sub.ujian?.mataKuliah || { nama: 'Mata Kuliah' }
        },
        score: sub.score,
        aiScore: sub.score,
        createdAt: sub.createdAt
      };
    });

    if (totalSubmissions === 0) {
      return res.status(200).json({
        success: true,
        message: 'Belum ada data pengerjaan riil. Menampilkan simulasi statistik AI.',
        isSimulated: true,
        data: {
          totalSubmissions: 28,
          averageScore: 84.5,
          distribution: {
            perfect: 5,
            excellent: 15,
            good: 6,
            poor: 2
          },
          submissions: [
            {
              id: 'sim-1',
              user: { nama: 'Budi Santoso', email: 'budi@lms.com' },
              pertemuan: { urutan: 3, mataKuliah: { nama: 'Dasar Pemrograman Web' } },
              score: 90,
              aiScore: 90,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sim-2',
              user: { nama: 'Ani Setyawati', email: 'ani@lms.com' },
              pertemuan: { urutan: 3, mataKuliah: { nama: 'Dasar Pemrograman Web' } },
              score: 100,
              aiScore: 100,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sim-3',
              user: { nama: 'Candra Wijaya', email: 'candra@lms.com' },
              pertemuan: { urutan: 2, mataKuliah: { nama: 'Dasar Pemrograman Web' } },
              score: 80,
              aiScore: 80,
              createdAt: new Date().toISOString()
            }
          ]
        }
      });
    }

    return res.status(200).json({
      success: true,
      isSimulated: false,
      data: {
        totalSubmissions,
        averageScore: parseFloat(avgScore.toFixed(1)),
        distribution,
        submissions: formattedSubmissions
      }
    });
  } catch (error) {
    console.error('Error in getStatsPGHandler:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server',
    });
  }
};

module.exports = { evaluasiSoalHandler, indexSoalHandler, getStatsPGHandler };
