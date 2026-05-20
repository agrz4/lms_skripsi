const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const register = async (req, res) => {
  const { nama, email, password, role } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: role || 'MAHASISWA'
      }
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const include = {};
    if (req.user.role === 'DOSEN') {
      include.mataKuliah = true;
      include.jadwalDosen = {
        include: {
          mataKuliah: true
        }
      };
    } else if (req.user.role === 'ASISTEN') {
      include.jadwalAsisten = {
        include: {
          mataKuliah: true
        }
      };
    } else if (req.user.role === 'MAHASISWA') {
      include.pendaftaran = {
        include: {
          mataKuliah: true
        }
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: Object.keys(include).length > 0 ? include : undefined
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama)}&background=random&color=fff&size=128`;
    
    let gelar = 'Mahasiswa';
    let assignedMaterials = [];

    if (user.role === 'ADMIN') {
      gelar = 'Administrator';
    } else if (user.role === 'DOSEN') {
      gelar = 'Dosen Pengampu';
      assignedMaterials = (user.mataKuliah || []).map(mk => ({
        id: mk.id,
        nama: mk.nama,
        kode: mk.kode,
        type: 'Mata Kuliah'
      })).concat((user.jadwalDosen || []).map(j => ({
        id: j.id,
        nama: `Pertemuan ${j.urutan}: ${j.topik || 'Topik Belum Ditentukan'}`,
        type: 'Sesi Pertemuan'
      })));
    } else if (user.role === 'ASISTEN') {
      gelar = 'Asisten Praktikum';
      assignedMaterials = (user.jadwalAsisten || []).map(j => ({
        id: j.id,
        nama: `${j.mataKuliah?.nama || 'Mata Kuliah'} - Pertemuan ${j.urutan}: ${j.topik || 'Topik Belum Ditentukan'}`,
        type: 'Sesi Asisten'
      }));
    } else if (user.role === 'MAHASISWA') {
      gelar = 'Mahasiswa';
      assignedMaterials = (user.pendaftaran || []).map(p => ({
        id: p.mataKuliah?.id,
        nama: p.mataKuliah?.nama,
        kode: p.mataKuliah?.kode,
        type: 'Mata Kuliah Enrolled'
      }));
    }

    res.json({
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      instansi: user.instansi,
      pelatihan: user.pelatihan,
      jadwal: user.jadwal,
      avatar,
      gelar,
      assignedMaterials,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, register, getMe };
