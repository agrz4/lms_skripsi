const prisma = require('../config/db');

const createPendaftaran = async (req, res) => {
  const { mataKuliahId } = req.body;
  const userId = req.user.id; // From authMiddleware

  try {
    const pendaftaran = await prisma.pendaftaran.create({
      data: {
        userId,
        mataKuliahId
      }
    });
    res.status(201).json(pendaftaran);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Anda sudah terdaftar di kursus ini.' });
    }
    res.status(400).json({ message: error.message });
  }
};

const getPendaftaranByUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const pendaftaran = await prisma.pendaftaran.findMany({
      where: { userId },
      include: {
        mataKuliah: true
      }
    });
    res.json(pendaftaran);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPendaftaran, getPendaftaranByUser };
