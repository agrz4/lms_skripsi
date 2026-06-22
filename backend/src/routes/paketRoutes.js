const express = require('express');
const router = express.Router();
const { getAllPaket, createPaket, deletePaket } = require('../controllers/paketController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAllPaket);
router.post('/', authMiddleware, adminOnly, createPaket);
router.delete('/:id', authMiddleware, adminOnly, deletePaket);

module.exports = router;
