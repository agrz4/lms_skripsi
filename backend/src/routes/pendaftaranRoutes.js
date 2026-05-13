const express = require('express');
const router = express.Router();
const { createPendaftaran, getPendaftaranByUser } = require('../controllers/pendaftaranController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createPendaftaran);
router.get('/my', authMiddleware, getPendaftaranByUser);

module.exports = router;
