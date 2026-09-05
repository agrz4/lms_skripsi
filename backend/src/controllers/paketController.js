const prisma = require('../config/db');

const getAllPaket = async (req, res) => {
  try {
    const pakets = await prisma.paket.findMany({
      include: {
        courses: true
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

const updatePaket = async (req, res) => {
  const { id } = req.params;
  const { nama, deskripsi, hargaPaket, hargaAsli, courses } = req.body;
  try {
    const dataToUpdate = {};
    if (nama !== undefined) dataToUpdate.nama = nama;
    if (deskripsi !== undefined) dataToUpdate.deskripsi = deskripsi;
    if (hargaPaket !== undefined) dataToUpdate.hargaPaket = hargaPaket;
    if (hargaAsli !== undefined) dataToUpdate.hargaAsli = hargaAsli;
    if (courses !== undefined && Array.isArray(courses)) {
      dataToUpdate.courses = {
        set: courses.map(courseId => ({ id: courseId }))
      };
    }

    const updatedPaket = await prisma.paket.update({
      where: { id },
      data: dataToUpdate,
      include: {
        courses: true
      }
    });

    res.json(updatedPaket);
  } catch (error) {
    console.error("Error in updatePaket:", error);
    res.status(400).json({ message: error.message });
  }
};

const addCourseToPaket = async (req, res) => {
  const { id } = req.params;
  const { courseId, courseIds } = req.body;
  try {
    const idsToAdd = courseIds && Array.isArray(courseIds)
      ? courseIds
      : (courseId ? [courseId] : []);

    if (idsToAdd.length === 0) {
      return res.status(400).json({ message: 'courseId atau courseIds harus diisi' });
    }

    const updatedPaket = await prisma.paket.update({
      where: { id },
      data: {
        courses: {
          connect: idsToAdd.map(cId => ({ id: cId }))
        }
      },
      include: {
        courses: true
      }
    });

    res.json(updatedPaket);
  } catch (error) {
    console.error("Error in addCourseToPaket:", error);
    res.status(400).json({ message: error.message });
  }
};

const removeCourseFromPaket = async (req, res) => {
  const { id, courseId } = req.params;
  try {
    const updatedPaket = await prisma.paket.update({
      where: { id },
      data: {
        courses: {
          disconnect: { id: courseId }
        }
      },
      include: {
        courses: true
      }
    });

    res.json(updatedPaket);
  } catch (error) {
    console.error("Error in removeCourseFromPaket:", error);
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
  updatePaket,
  addCourseToPaket,
  removeCourseFromPaket,
  deletePaket
};
