const prisma = require('../config/db');

const getAllMataKuliah = async (req, res) => {
  try {
    const mataKuliah = await prisma.mataKuliah.findMany();
    res.json(mataKuliah);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createMataKuliah = async (req, res) => {
  const { nama, kode } = req.body;
  try {
    const mataKuliah = await prisma.mataKuliah.create({
      data: { nama, kode }
    });
    res.status(201).json(mataKuliah);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMataKuliah = async (req, res) => {
  const { id } = req.params;
  const { nama, kode } = req.body;
  try {
    const mataKuliah = await prisma.mataKuliah.update({
      where: { id },
      data: { nama, kode }
    });
    res.json(mataKuliah);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMataKuliah = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.mataKuliah.delete({ where: { id } });
    res.json({ message: 'Mata Kuliah deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAllMataKuliah, createMataKuliah, updateMataKuliah, deleteMataKuliah };
