const express = require('express');
const router = express.Router();
const { getAllJadwal, createJadwal, updateJadwal, deleteJadwal } = require('../controllers/jadwalController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAllJadwal);
router.post('/', authMiddleware, adminOnly, createJadwal);
router.put('/:id', authMiddleware, adminOnly, updateJadwal);
router.delete('/:id', authMiddleware, adminOnly, deleteJadwal);

module.exports = router;
