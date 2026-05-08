const express = require('express');
const router = express.Router();
const { getAllMateri, createMateri, updateMateri, deleteMateri } = require('../controllers/materiController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAllMateri);
router.post('/', authMiddleware, adminOnly, createMateri);
router.put('/:id', authMiddleware, adminOnly, updateMateri);
router.delete('/:id', authMiddleware, adminOnly, deleteMateri);

module.exports = router;
