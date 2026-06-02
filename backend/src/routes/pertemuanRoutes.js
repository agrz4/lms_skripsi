const express = require('express');
const router = express.Router();
const { getAllPertemuan, updatePertemuan, deletePertemuan, getPertemuanById } = require('../controllers/pertemuanController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAllPertemuan);
router.get('/:id', authMiddleware, getPertemuanById);
router.patch('/:id', authMiddleware, updatePertemuan);
router.delete('/:id', authMiddleware, deletePertemuan);

module.exports = router;
