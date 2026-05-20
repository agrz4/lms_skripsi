const express = require('express');
const router = express.Router();
const { getKoreksiList, submitNilai, getFileDetail } = require('../controllers/koreksiController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Staff only check (Dosen, Asisten, Admin)
const staffOnly = (req, res, next) => {
  if (req.user && req.user.role !== 'MAHASISWA') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Staff only' });
  }
};

router.use(authMiddleware);
router.use(staffOnly);

router.get('/list', getKoreksiList);
router.post('/submit-nilai', submitNilai);
router.get('/file-detail/:id', getFileDetail);

module.exports = router;
