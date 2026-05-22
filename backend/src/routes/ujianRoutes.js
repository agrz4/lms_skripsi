const express = require('express');
const router = express.Router();
const { getUjianSoal, submitUjian, getUjianResult } = require('../controllers/ujianController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/soal', authMiddleware, getUjianSoal);
router.post('/submit', authMiddleware, submitUjian);
router.get('/result', authMiddleware, getUjianResult);

module.exports = router;
