const prisma = require('../config/db');

const getAllMataKuliah = async (req, res) => {
  try {
    const mataKuliah = await prisma.mataKuliah.findMany({
      include: {
        _count: {
          select: {
            pendaftaran: true,
            pertemuan: true
          }
        },
        pertemuan: {
          orderBy: { urutan: 'asc' },
          include: {
            materi: true
          }
        },
        prerequisites: true,
        prerequisiteFor: true,
        pengajar: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      }
    });
    res.json(mataKuliah);
  } catch (error) {
    console.error("Error in getAllMataKuliah:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createMataKuliah = async (req, res) => {
  const { nama, kode, deskripsi, kapasitas, kategori, statusPendaftaran, tipeKursus, pengajarId, level, warna } = req.body;
  try {
    // 1. Create Mata Kuliah
    const mataKuliah = await prisma.mataKuliah.create({
      data: {
        nama,
        kode,
        deskripsi: deskripsi || undefined,
        kapasitas: kapasitas ? parseInt(kapasitas) : undefined,
        kategori: kategori || undefined,
        level: level || undefined,
        warna: warna || undefined,
        statusPendaftaran: statusPendaftaran || undefined,
        tipeKursus: tipeKursus ? tipeKursus.toUpperCase() : undefined,
        pengajarId: pengajarId || undefined
      }
    });

    // 2. Automatically create 14 empty sessions (Pertemuan)
    const meetingsData = Array.from({ length: 14 }, (_, i) => ({
      mataKuliahId: mataKuliah.id,
      urutan: i + 1,
      topik: `Pertemuan ${i + 1}`
    }));

    await prisma.pertemuan.createMany({
      data: meetingsData
    });

    res.status(201).json(mataKuliah);
  } catch (error) {
    console.error("Error in createMataKuliah:", error);
    res.status(400).json({ message: error.message });
  }
};

const updateMataKuliah = async (req, res) => {
  const { id } = req.params;
  const { nama, kode, published, deskripsi, kapasitas, kategori, statusPendaftaran, tipeKursus, pengajarId, level, warna, prerequisites } = req.body;
  try {
    const mataKuliah = await prisma.mataKuliah.update({
      where: { id },
      data: {
        nama,
        kode,
        published,
        deskripsi: deskripsi || undefined,
        kapasitas: kapasitas ? parseInt(kapasitas) : undefined,
        kategori: kategori || undefined,
        level: level || undefined,
        warna: warna || undefined,
        statusPendaftaran: statusPendaftaran || undefined,
        tipeKursus: tipeKursus ? tipeKursus.toUpperCase() : undefined,
        pengajarId: pengajarId || undefined,
        prerequisites: prerequisites ? {
          set: prerequisites.map(pId => ({ id: typeof pId === 'object' ? pId.id : pId }))
        } : undefined
      },
      include: {
        prerequisites: true,
        prerequisiteFor: true
      }
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

const getPublishedMataKuliah = async (req, res) => {
  try {
    const mataKuliah = await prisma.mataKuliah.findMany({
      where: { published: true },
      include: {
        _count: {
          select: {
            pendaftaran: true,
            pertemuan: true
          }
        },
        pengajar: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      }
    });
    res.json(mataKuliah);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllMataKuliah, createMataKuliah, updateMataKuliah, deleteMataKuliah, getPublishedMataKuliah };
