const prisma = require('../config/db');

const getAllPertemuan = async (req, res) => {
  const { mataKuliahId } = req.query;
  try {
    const pertemuan = await prisma.pertemuan.findMany({
      where: mataKuliahId ? { mataKuliahId } : {},
      orderBy: { urutan: 'asc' },
      include: {
        mataKuliah: true,
        dosen: { select: { id: true, nama: true } },
        asisten: { select: { id: true, nama: true } },
        materi: true
      }
    });
    res.json(pertemuan);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePertemuan = async (req, res) => {
  const { id } = req.params;
  const { topik, tgl, jam, dosenId, asistenId } = req.body;
  try {
    const pertemuan = await prisma.pertemuan.update({
      where: { id },
      data: {
        topik: topik || undefined,
        tgl: tgl ? new Date(tgl) : undefined,
        jam: jam || undefined,
        dosenId: dosenId || undefined,
        asistenId: asistenId || undefined
      }
    });
    res.json(pertemuan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePertemuan = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.pertemuan.delete({ where: { id } });
    res.json({ message: 'Pertemuan deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAllPertemuan, updatePertemuan, deletePertemuan };
