const prisma = require('../config/db');

const getAllPaket = async (req, res) => {
  try {
    const pakets = await prisma.paket.findMany({
      include: {
        courses: {
          select: {
            id: true,
            nama: true,
            kode: true,
            warna: true,
            level: true,
            published: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(pakets);
  } catch (error) {
    console.error("Error in getAllPaket:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createPaket = async (req, res) => {
  const { nama, deskripsi, hargaPaket, hargaAsli, courses } = req.body;
  try {
    if (!nama) {
      return res.status(400).json({ message: 'Nama Paket harus diisi' });
    }
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: 'Pilih setidaknya satu kursus' });
    }

    const newPaket = await prisma.paket.create({
      data: {
        nama,
        deskripsi,
        hargaPaket: hargaPaket || "0",
        hargaAsli: hargaAsli || "0",
        courses: {
          connect: courses.map(id => ({ id }))
        }
      },
      include: {
        courses: true
      }
    });

    res.status(201).json(newPaket);
  } catch (error) {
    console.error("Error in createPaket:", error);
    res.status(400).json({ message: error.message });
  }
};

const deletePaket = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.paket.delete({
      where: { id }
    });
    res.json({ message: 'Paket Bundling deleted successfully' });
  } catch (error) {
    console.error("Error in deletePaket:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllPaket,
  createPaket,
  deletePaket
};
