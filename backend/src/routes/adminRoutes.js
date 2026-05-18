const express = require('express');
const router = express.Router();
const { assignPengajar, aiSync } = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

// Proteksi seluruh route admin agar hanya bisa diakses oleh ADMIN
router.use(authMiddleware);
router.use(adminOnly);

// Route Assignment Logic
router.post('/assign-pengajar', assignPengajar);

// Route AI Knowledge Sync
router.post('/ai-sync', aiSync);

module.exports = router;
