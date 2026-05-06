const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/dashboardController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/stats', authMiddleware, adminOnly, getAdminStats);

module.exports = router;
