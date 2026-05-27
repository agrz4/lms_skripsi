const prisma = require('../config/db');

/**
 * GET /api/koreksi/list
 * Mengambil daftar tugas (Refleksi/Upload) yang masuk dari mahasiswa.
 * Di-filter berdasarkan penugasan Dosen/Asisten pada pertemuan.
 */
const getKoreksiList = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    let whereClause = {};

    // Filter berdasarkan role: Jika asisten, ambil yang di-assign ke dirinya ATAU yang belum di-assign (null) agar tidak kosong saat simulasi/demo
    if (userRole === 'ASISTEN') {
      whereClause = {
        pertemuan: {
          OR: [
            { asistenId: userId },
            { asistenId: null }
          ]
        }
      };
    } else if (userRole === 'DOSEN') {
      whereClause = {
        pertemuan: {
          OR: [
            { dosenId: userId },
            { mataKuliah: { pengajarId: userId } }
          ]
        }
      };
    } // Jika ADMIN, whereClause kosong (mengambil seluruh data)

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, nama: true, email: true, instansi: true }
        },
        pertemuan: {
          include: {
            mataKuliah: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error in getKoreksiList:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server saat mengambil list koreksi' 
    });
  }
};

/**
 * POST /api/koreksi/submit-nilai
 * Mengirim nilai akhir (0-100) dan feedback dari asisten/dosen.
 */
const submitNilai = async (req, res) => {
  const { submissionId, score, feedback } = req.body;

  if (!submissionId || score === undefined) {
    return res.status(400).json({ 
      success: false, 
      message: 'submissionId dan score wajib diisi' 
    });
  }

  const numericScore = parseFloat(score);
  if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
    return res.status(400).json({ 
      success: false, 
      message: 'Score harus berupa angka valid antara 0 dan 100' 
    });
  }

  try {
    // Cari submission target untuk mendapatkan userId dan pertemuanId
    const targetSub = await prisma.submission.findUnique({
      where: { id: submissionId }
    });

    if (!targetSub) {
      return res.status(404).json({
        success: false,
        message: 'Submission tidak ditemukan'
      });
    }

    // Update semua submission untuk user & pertemuan yang sama
    await prisma.submission.updateMany({
      where: {
        userId: targetSub.userId,
        pertemuanId: targetSub.pertemuanId
      },
      data: {
        score: numericScore,
        feedback: feedback || null
      }
    });

    // Ambil ulang data submission target untuk respon yang kaya detail
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: { nama: true }
        },
        pertemuan: {
          select: { urutan: true }
        }
      }
    });

    res.json({
      success: true,
      message: `Nilai berhasil disimpan untuk ${submission.user.nama} di Pertemuan ${submission.pertemuan.urutan}`,
      data: submission
    });
  } catch (error) {
    console.error('Error in submitNilai:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server saat menyimpan nilai' 
    });
  }
};

/**
 * GET /api/koreksi/file-detail/{id}
 * Mengambil link file/screenshot yang di-upload mhs untuk di-preview.
 */
const getFileDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, nama: true, email: true }
        },
        pertemuan: {
          include: {
            mataKuliah: true
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Data submission tidak ditemukan' 
      });
    }

    // Ambil semua submission lain dari user yang sama untuk pertemuan yang sama
    const allSubmissions = await prisma.submission.findMany({
      where: {
        userId: submission.userId,
        pertemuanId: submission.pertemuanId
      }
    });

    res.json({
      success: true,
      data: {
        ...submission,
        allSubmissions
      }
    });
  } catch (error) {
    console.error('Error in getFileDetail:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan pada server saat mengambil detail file' 
    });
  }
};

module.exports = {
  getKoreksiList,
  submitNilai,
  getFileDetail
};
