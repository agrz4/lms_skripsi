const express = require('express');
const router = express.Router();
const { evaluasiSoalHandler, indexSoalHandler } = require('../controllers/aiController');
// const { authMiddleware, dosenOnly } = require('../middlewares/authMiddleware');

// Note: Middlewares are commented out because they are not yet implemented based on the README snippets
// In a real scenario, you should implement them in ../middlewares/authMiddleware.js

// POST /api/ai/evaluasi - Evaluasi soal menggunakan RAG
router.post('/evaluasi', evaluasiSoalHandler);

// POST /api/ai/index - Index soal ke vector database
router.post('/index', indexSoalHandler);

module.exports = router;
