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

module.exports = { evaluasiSoalHandler, indexSoalHandler };
