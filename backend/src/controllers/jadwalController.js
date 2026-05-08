const prisma = require('../config/db');

const getAllJadwal = async (req, res) => {
  try {
    const jadwal = await prisma.jadwal.findMany({
      include: {
        mataKuliah: true,
        dosen: { select: { id: true, nama: true } },
        asisten: { select: { id: true, nama: true } }
      }
    });
    res.json(jadwal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createJadwal = async (req, res) => {
  const { mataKuliahId, hari, tglMulai, tglSelesai, dosenId, asistenId } = req.body;
  try {
    const jadwal = await prisma.jadwal.create({
      data: {
        mataKuliahId,
        hari,
        tglMulai: new Date(tglMulai),
        tglSelesai: new Date(tglSelesai),
        dosenId,
        asistenId
      }
    });
    res.status(201).json(jadwal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateJadwal = async (req, res) => {
  const { id } = req.params;
  const { mataKuliahId, hari, tglMulai, tglSelesai, dosenId, asistenId } = req.body;
  try {
    const jadwal = await prisma.jadwal.update({
      where: { id },
      data: {
        mataKuliahId,
        hari,
        tglMulai: tglMulai ? new Date(tglMulai) : undefined,
        tglSelesai: tglSelesai ? new Date(tglSelesai) : undefined,
        dosenId,
        asistenId
      }
    });
    res.json(jadwal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteJadwal = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.jadwal.delete({ where: { id } });
    res.json({ message: 'Jadwal deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAllJadwal, createJadwal, updateJadwal, deleteJadwal };
