const express = require('express');
const router = express.Router();
const { 
  getAllMateri, 
  createMateri, 
  updateMateri, 
  deleteMateri, 
  uploadVideo, 
  uploadSubmateri, 
  createLatihanPG 
} = require('../controllers/materiController');
const { authMiddleware, dosenOnly } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', authMiddleware, getAllMateri);
router.post('/', authMiddleware, dosenOnly, createMateri);
router.post('/create', authMiddleware, dosenOnly, createMateri);
router.post('/upload-video', authMiddleware, dosenOnly, upload.single('video'), uploadVideo);
router.post('/upload-submateri', authMiddleware, dosenOnly, upload.single('file'), uploadSubmateri);
router.post('/latihan-pg', authMiddleware, dosenOnly, createLatihanPG);

router.put('/:id', authMiddleware, dosenOnly, updateMateri);
router.delete('/:id', authMiddleware, dosenOnly, deleteMateri);

module.exports = router;
