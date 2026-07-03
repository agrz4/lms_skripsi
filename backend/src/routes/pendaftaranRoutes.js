const express = require('express');
const router = express.Router();
const { createPendaftaran, getPendaftaranByUser, getUserReferrals } = require('../controllers/pendaftaranController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, createPendaftaran);
router.get('/my', authMiddleware, getPendaftaranByUser);
router.get('/referrals', authMiddleware, getUserReferrals);

module.exports = router;
