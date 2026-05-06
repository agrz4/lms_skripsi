const express = require('express');
const router = express.Router();
const { evaluasiSoalHandler, indexSoalHandler } = require('../controllers/aiController');
const { authMiddleware, dosenOnly } = require('../middlewares/authMiddleware');

// POST /api/ai/evaluasi - Evaluasi soal menggunakan RAG
router.post('/evaluasi', authMiddleware, dosenOnly, evaluasiSoalHandler);

// POST /api/ai/index - Index soal ke vector database
router.post('/index', authMiddleware, dosenOnly, indexSoalHandler);

module.exports = router;
