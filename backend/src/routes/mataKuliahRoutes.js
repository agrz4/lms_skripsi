const express = require('express');
const router = express.Router();
const { getAllMataKuliah, createMataKuliah, updateMataKuliah, deleteMataKuliah, getPublishedMataKuliah } = require('../controllers/mataKuliahController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAllMataKuliah);
router.get('/published', authMiddleware, getPublishedMataKuliah);
router.post('/', authMiddleware, adminOnly, createMataKuliah);
router.put('/:id', authMiddleware, adminOnly, updateMataKuliah);
router.delete('/:id', authMiddleware, adminOnly, deleteMataKuliah);

module.exports = router;
