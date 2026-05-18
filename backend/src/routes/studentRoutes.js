const express = require('express');
const router = express.Router();
const { submitRefleksi, uploadTugas, updateProgress, getProgress, getSubmissions } = require('../controllers/studentController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Seluruh route student membutuhkan autentikasi
router.use(authMiddleware);

// Route untuk Submit Jawaban Refleksi
router.post('/refleksi/submit', submitRefleksi);

// Route untuk Upload File Tugas Praktik (Screenshot/Program ZIP)
router.post('/upload/tugas', uploadTugas);

// Route untuk Get Semua Submission Siswa per Pertemuan
router.get('/submissions', getSubmissions);

// Route untuk Update & Get Progres Belajar Sesi (P1-P14)
router.post('/status/progres', updateProgress);
router.get('/status/progres', getProgress);

module.exports = router;
