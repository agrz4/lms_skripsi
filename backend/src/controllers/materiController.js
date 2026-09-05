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
    // Clear old choice questions for this session to prevent duplicates
    if (pertemuanId) {
      const existingSoal = await prisma.soal.findMany({
        where: { pertemuanId, tipesoal: 'PILIHAN_GANDA' }
      });
      const existingSoalIds = existingSoal.map(s => s.id);
      if (existingSoalIds.length > 0) {
        await prisma.soalVector.deleteMany({
          where: { soalId: { in: existingSoalIds } }
        });
        await prisma.evaluasi.deleteMany({
          where: { soalId: { in: existingSoalIds } }
        });
        await prisma.soal.deleteMany({
          where: { id: { in: existingSoalIds } }
        });
      }
    }

    const { indexSoal } = require('../services/ragService');
    const createdSoalList = [];

    const normalizeQuestionText = (input) => {
      if (!input) return '';
      if (typeof input === 'object') return JSON.stringify(input);
      const trimmed = input.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) return trimmed;
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|').map(p => p.trim());
        if (parts.length >= 6) {
          const qObj = {
            pertanyaan: parts[0],
            options: {
              A: parts[1],
              B: parts[2],
              C: parts[3],
              D: parts[4]
            },
            correctAnswer: (parts[5].toUpperCase() || 'A')
          };
          return JSON.stringify(qObj);
        }
      }
      return trimmed;
    };
    
    if (soalList && Array.isArray(soalList)) {
      for (const item of soalList) {
        const rawInput = item && typeof item === 'object' && item.pertanyaan !== undefined ? item.pertanyaan : item;
        const qText = normalizeQuestionText(rawInput);
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
      
      const qText = normalizeQuestionText(pertanyaan);
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

const getLatihanPG = async (req, res) => {
  const { pertemuanId } = req.query;
  if (!pertemuanId) {
    return res.status(400).json({ message: 'pertemuanId wajib diisi' });
  }
  try {
    const soal = await prisma.soal.findMany({
      where: {
        pertemuanId,
        tipesoal: 'PILIHAN_GANDA'
      }
    });
    res.json(soal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getAllMateri, 
  createMateri, 
  updateMateri, 
  deleteMateri,
  uploadVideo,
  uploadSubmateri,
  createLatihanPG,
  getLatihanPG
};
