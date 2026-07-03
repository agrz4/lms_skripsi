const prisma = require('../config/db');

const createPendaftaran = async (req, res) => {
  const { mataKuliahId, referralCode, harga, invoiceNo, status, method } = req.body;
  const userId = req.user.id; // From authMiddleware

  try {
    const pendaftaran = await prisma.pendaftaran.create({
      data: {
        userId,
        mataKuliahId,
        referralCode: referralCode || null,
        harga: harga || "0",
        invoiceNo: invoiceNo || null,
        status: status || "Lunas",
        method: method || "Mandiri Virtual Account"
      }
    });
    res.status(201).json(pendaftaran);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Anda sudah terdaftar di kursus ini.' });
    }
    res.status(450).json({ message: error.message });
  }
};

const getPendaftaranByUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const pendaftaran = await prisma.pendaftaran.findMany({
      where: { userId },
      include: {
        mataKuliah: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(pendaftaran);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserReferrals = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cleanName = user.nama.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);
    const referralCode = `LMS-${cleanName || 'USER'}-2026`;

    const referrals = await prisma.pendaftaran.findMany({
      where: { referralCode },
      include: {
        user: {
          select: {
            nama: true,
            email: true
          }
        },
        mataKuliah: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(referrals);
  } catch (error) {
    console.error("Error in getUserReferrals:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPendaftaran, getPendaftaranByUser, getUserReferrals };
