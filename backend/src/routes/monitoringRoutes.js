const express = require('express');
const router = express.Router();
const { getMateriAssigned, getMonitoringStats, getDetailMhs } = require('../controllers/monitoringController');
const { authMiddleware, dosenOnly } = require('../middlewares/authMiddleware');

router.use(authMiddleware);
router.use(dosenOnly);

router.get('/materi-assigned', getMateriAssigned);
router.get('/stats', getMonitoringStats);
router.get('/detail-mhs', getDetailMhs);

module.exports = router;
