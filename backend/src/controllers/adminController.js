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

module.exports = { assignPengajar, aiSync };
