const prisma = require('../config/db');

/**
 * GET /api/monitoring/materi-assigned
 * Mengambil list materi yang diajar oleh dosen ini (berdasarkan dosenId di pertemuan atau pengajarId di mataKuliah).
 */
const getMateriAssigned = async (req, res) => {
  try {
    const materiList = await prisma.materi.findMany({
      where: {
        OR: [
          { pertemuan: { dosenId: req.user.id } },
          { mataKuliah: { pengajarId: req.user.id } }
        ]
      },
      include: {
        pertemuan: {
          include: {
            dosen: { select: { id: true, nama: true } },
            asisten: { select: { id: true, nama: true } }
          }
        },
        mataKuliah: true
      }
    });

    res.json({
      success: true,
      data: materiList
    });
  } catch (error) {
    console.error('Error in getMateriAssigned:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server saat mengambil materi' 
    });
  }
};

/**
 * GET /api/monitoring/stats
 * Agregasi statistik: rata-rata nilai, total mahasiswa, dan keaktifan (persentase pertemuan yang selesai).
 */
const getMonitoringStats = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    // Ambil list pertemuan yang diajar dosen ini
    const pertemuans = await prisma.pertemuan.findMany({
      where: {
        OR: [
          { dosenId: lecturerId },
          { mataKuliah: { pengajarId: lecturerId } }
        ]
      },
      select: { id: true }
    });
    const pertemuanIds = pertemuans.map(p => p.id);

    // 1. Agregasi Rata-rata Nilai (dari manual score, fallback ke 75 jika kosong)
    const submissions = await prisma.submission.findMany({
      where: {
        pertemuanId: { in: pertemuanIds }
      },
      select: { score: true }
    });
    const validScores = submissions
      .map(s => s.score)
      .filter(score => score !== null && score !== undefined);
    
    const avgScore = validScores.length > 0
      ? (validScores.reduce((sum, val) => sum + val, 0) / validScores.length)
      : 75.0;

    // 2. Total Mahasiswa Unik di kelas dosen tersebut
    const totalMhs = await prisma.user.count({
      where: {
        role: 'MAHASISWA',
        pendaftaran: {
          some: {
            mataKuliah: {
              OR: [
                { pengajarId: lecturerId },
                { pertemuan: { some: { dosenId: lecturerId } } }
              ]
            }
          }
        }
      }
    });

    // 3. Keaktifan: persentase isCompleted true pada StudentProgress untuk pertemuan terkait
    const totalProgress = await prisma.studentProgress.count({
      where: {
        pertemuanId: { in: pertemuanIds }
      }
    });
    const completedProgress = await prisma.studentProgress.count({
      where: {
        pertemuanId: { in: pertemuanIds },
        isCompleted: true
      }
    });

    const completionRate = totalProgress > 0
      ? Math.round((completedProgress / totalProgress) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        avgScore: parseFloat(avgScore.toFixed(1)),
        totalStudents: totalMhs,
        completionRate
      }
    });
  } catch (error) {
    console.error('Error in getMonitoringStats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server saat menghitung stats' 
    });
  }
};

/**
 * GET /api/monitoring/detail-mhs?pertemuanId={id}
 * Mengambil daftar mahasiswa beserta progress tontonan & upload tugas pada pertemuan tertentu.
 */
const getDetailMhs = async (req, res) => {
  const { pertemuanId } = req.query;

  if (!pertemuanId) {
    return res.status(400).json({ 
      success: false, 
      message: 'pertemuanId wajib disertakan dalam query' 
    });
  }

  try {
    const pertemuan = await prisma.pertemuan.findUnique({
      where: { id: pertemuanId },
      select: { mataKuliahId: true, urutan: true, topik: true }
    });

    if (!pertemuan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pertemuan tidak ditemukan' 
      });
    }

    // Ambil semua pendaftaran di mata kuliah tersebut
    const enrollments = await prisma.pendaftaran.findMany({
      where: { mataKuliahId: pertemuan.mataKuliahId },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            progress: {
              where: { pertemuanId }
            },
            submissions: {
              where: { pertemuanId }
            }
          }
        }
      }
    });

    const studentsData = enrollments.map(enroll => {
      const student = enroll.user;
      const progress = student.progress[0] || null;
      return {
        id: student.id,
        nama: student.nama,
        email: student.email,
        watchedTime: progress ? progress.watchedTime : 0,
        isCompleted: progress ? progress.isCompleted : false,
        submissions: student.submissions || []
      };
    });

    res.json({
      success: true,
      data: {
        pertemuan: {
          id: pertemuanId,
          urutan: pertemuan.urutan,
          topik: pertemuan.topik
        },
        students: studentsData
      }
    });
  } catch (error) {
    console.error('Error in getDetailMhs:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server saat mengambil detail mahasiswa' 
    });
  }
};

module.exports = {
  getMateriAssigned,
  getMonitoringStats,
  getDetailMhs
};
