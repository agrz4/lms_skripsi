const prisma = require('../config/db');

const getAllPertemuan = async (req, res) => {
  const { mataKuliahId, dosenId, asistenId } = req.query;
  try {
    const where = {};
    if (mataKuliahId) where.mataKuliahId = mataKuliahId;
    if (dosenId) where.dosenId = dosenId;
    if (asistenId) where.asistenId = asistenId;

    const pertemuan = await prisma.pertemuan.findMany({
      where,
      orderBy: { urutan: 'asc' },
      include: {
        mataKuliah: true,
        dosen: { select: { id: true, nama: true } },
        asisten: { select: { id: true, nama: true } },
        materi: true,
        soal: true
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
        topik: topik !== undefined ? topik : undefined,
        tgl: tgl !== undefined ? (tgl ? new Date(tgl) : null) : undefined,
        jam: jam !== undefined ? jam : undefined,
        dosenId: dosenId !== undefined ? dosenId : undefined,
        asistenId: asistenId !== undefined ? asistenId : undefined
      },
      include: {
        mataKuliah: true,
        dosen: { select: { id: true, nama: true } },
        asisten: { select: { id: true, nama: true } },
        materi: true,
        soal: true
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

const getPertemuanById = async (req, res) => {
  const { id } = req.params;
  try {
    const pertemuan = await prisma.pertemuan.findUnique({
      where: { id },
      include: {
        mataKuliah: true,
        dosen: { select: { id: true, nama: true } },
        asisten: { select: { id: true, nama: true } },
        materi: true,
        soal: true
      }
    });
    if (!pertemuan) {
      return res.status(404).json({ message: 'Pertemuan tidak ditemukan' });
    }
    res.json(pertemuan);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllPertemuan, updatePertemuan, deletePertemuan, getPertemuanById };
