const prisma = require('../config/db');

const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMahasiswa,
      totalDosen,
      totalAdmin,
      totalMataKuliah,
      totalSoal,
      totalEvaluasi
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MAHASISWA' } }),
      prisma.user.count({ where: { role: 'DOSEN' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.mataKuliah.count(),
      prisma.soal.count(),
      prisma.evaluasi.count()
    ]);

    res.json({
      users: {
        total: totalUsers,
        mahasiswa: totalMahasiswa,
        dosen: totalDosen,
        admin: totalAdmin
      },
      mataKuliah: totalMataKuliah,
      soal: totalSoal,
      evaluasi: totalEvaluasi
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAdminStats };
