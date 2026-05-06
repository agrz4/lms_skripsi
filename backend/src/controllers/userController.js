const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createUser = async (req, res) => {
  const { nama, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: role || 'MAHASISWA'
      }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nama, email, role, password } = req.body;
  try {
    const data = { nama, email, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id },
      data
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
