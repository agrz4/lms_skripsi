const express = require('express');
const router = express.Router();
const { getAllMataKuliah, createMataKuliah, updateMataKuliah, deleteMataKuliah } = require('../controllers/mataKuliahController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAllMataKuliah);
router.post('/', authMiddleware, adminOnly, createMataKuliah);
router.put('/:id', authMiddleware, adminOnly, updateMataKuliah);
router.delete('/:id', authMiddleware, adminOnly, deleteMataKuliah);

module.exports = router;
