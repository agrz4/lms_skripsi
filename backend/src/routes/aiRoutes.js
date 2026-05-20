const express = require('express');
const router = express.Router();
const { 
  evaluasiSoalHandler, 
  indexSoalHandler, 
  getStatsPGHandler 
} = require('../controllers/aiController');
const { authMiddleware, dosenOnly } = require('../middlewares/authMiddleware');

// Staff check for stats
const staffOnly = (req, res, next) => {
  if (req.user && req.user.role !== 'MAHASISWA') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Staff only' });
  }
};

// POST /api/ai/evaluasi - Evaluasi soal menggunakan RAG
router.post('/evaluasi', authMiddleware, dosenOnly, evaluasiSoalHandler);

// POST /api/ai/index - Index soal ke vector database
router.post('/index', authMiddleware, dosenOnly, indexSoalHandler);

// GET /api/ai/stats-pg - Statistik pengerjaan PG otomatis
router.get('/stats-pg', authMiddleware, staffOnly, getStatsPGHandler);

module.exports = router;
