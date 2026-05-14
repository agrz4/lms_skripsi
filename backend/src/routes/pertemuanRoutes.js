const express = require('express');
const router = express.Router();
const { getAllPertemuan, updatePertemuan, deletePertemuan } = require('../controllers/pertemuanController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAllPertemuan);
router.patch('/:id', authMiddleware, updatePertemuan);
router.delete('/:id', authMiddleware, deletePertemuan);

module.exports = router;
