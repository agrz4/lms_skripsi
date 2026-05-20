const prisma = require('../config/db');

const getAllMateri = async (req, res) => {
  const { mataKuliahId, pertemuanId } = req.query;
  try {
    const where = {};
    if (mataKuliahId) where.mataKuliahId = mataKuliahId;
    if (pertemuanId) where.pertemuanId = pertemuanId;

    const materi = await prisma.materi.findMany({
      where,
      include: {
        mataKuliah: true,
        pertemuan: true
      }
    });
    res.json(materi);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createMateri = async (req, res) => {
  const { nama, mataKuliahId, pertemuanId, fileUrl, videoUrl, refleksi } = req.body;
  try {
    const materi = await prisma.materi.create({
      data: {
        nama,
        mataKuliahId,
        pertemuanId,
        fileUrl,
        videoUrl,
        refleksi
      }
    });
    res.status(201).json(materi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMateri = async (req, res) => {
  const { id } = req.params;
  const { nama, fileUrl, videoUrl, refleksi } = req.body;
  try {
    const materi = await prisma.materi.update({
      where: { id },
      data: {
        nama,
        fileUrl,
        videoUrl,
        refleksi
      }
    });
    res.json(materi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMateri = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.materi.delete({ where: { id } });
    res.json({ message: 'Materi deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file video yang di-upload' });
  }
  try {
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/public/uploads/videos/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Video berhasil di-upload',
      fileUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadSubmateri = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file dokumen yang di-upload' });
  }
  try {
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/public/uploads/documents/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Dokumen sub-materi berhasil di-upload',
      fileUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLatihanPG = async (req, res) => {
  const { mataKuliahId, pertemuanId, pertanyaan, soalList } = req.body;
  
  if (!mataKuliahId) {
    return res.status(400).json({ message: 'mataKuliahId wajib diisi' });
  }
  
  try {
    const { indexSoal } = require('../services/ragService');
    const createdSoalList = [];
    
    if (soalList && Array.isArray(soalList)) {
      for (const item of soalList) {
        const qText = typeof item.pertanyaan === 'object' ? JSON.stringify(item.pertanyaan) : item.pertanyaan;
        const soal = await prisma.soal.create({
          data: {
            pertanyaan: qText,
            tipesoal: 'PILIHAN_GANDA',
            mataKuliahId,
            pertemuanId: pertemuanId || null,
            dibuatOleh: req.user.id
          }
        });
        
        try {
          await indexSoal(soal.id, qText, soal.mataKuliahId, { tipeSoal: 'PILIHAN_GANDA' });
        } catch (err) {
          console.error('Failed to index soal to RAG:', err);
        }
        createdSoalList.push(soal);
      }
    } else {
      if (!pertanyaan) {
        return res.status(400).json({ message: 'pertanyaan atau soalList wajib diisi' });
      }
      
      const qText = typeof pertanyaan === 'object' ? JSON.stringify(pertanyaan) : pertanyaan;
      const soal = await prisma.soal.create({
        data: {
          pertanyaan: qText,
          tipesoal: 'PILIHAN_GANDA',
          mataKuliahId,
          pertemuanId: pertemuanId || null,
          dibuatOleh: req.user.id
        }
      });
      
      try {
        await indexSoal(soal.id, qText, soal.mataKuliahId, { tipeSoal: 'PILIHAN_GANDA' });
      } catch (err) {
        console.error('Failed to index soal to RAG:', err);
      }
      createdSoalList.push(soal);
    }
    
    res.status(201).json({
      success: true,
      message: 'Soal latihan pilihan ganda berhasil disimpan dan diindeks',
      data: createdSoalList
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { 
  getAllMateri, 
  createMateri, 
  updateMateri, 
  deleteMateri,
  uploadVideo,
  uploadSubmateri,
  createLatihanPG
};
