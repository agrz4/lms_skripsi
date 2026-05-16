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

module.exports = { getAllMateri, createMateri, updateMateri, deleteMateri };
