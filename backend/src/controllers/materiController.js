const prisma = require('../config/db');

const getAllMateri = async (req, res) => {
  try {
    const materi = await prisma.materi.findMany({
      include: {
        mataKuliah: true
      }
    });
    res.json(materi);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createMateri = async (req, res) => {
  const { nama, mataKuliahId, fileUrl } = req.body;
  try {
    const materi = await prisma.materi.create({
      data: {
        nama,
        mataKuliahId,
        fileUrl
      }
    });
    res.status(201).json(materi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMateri = async (req, res) => {
  const { id } = req.params;
  const { nama, mataKuliahId, fileUrl } = req.body;
  try {
    const materi = await prisma.materi.update({
      where: { id },
      data: {
        nama,
        mataKuliahId,
        fileUrl
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
