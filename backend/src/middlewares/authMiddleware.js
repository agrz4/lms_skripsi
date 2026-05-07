const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, nama: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin only' });
  }
};

const dosenOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'DOSEN' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Dosen only' });
  }
};

const asistenOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'ASISTEN' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Asisten only' });
  }
};

module.exports = { authMiddleware, adminOnly, dosenOnly, asistenOnly };
