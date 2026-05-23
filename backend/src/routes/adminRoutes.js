const express = require('express');
const router = express.Router();
const { 
  assignPengajar, 
  aiSync, 
  getLaporanAkhir, 
  generateSertifikat, 
  downloadSertifikat,
  getSoalQueue,
  approveSoal,
  rejectSoal,
  getAIKnowledgeStatus
} = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

// Proteksi seluruh route admin agar membutuhkan login
router.use(authMiddleware);

// Route download sertifikat bisa diakses oleh mahasiswa yang telah menyelesaikan ujian
router.get('/sertifikat/download/:id', downloadSertifikat);

// Sisanya dilindungi role ADMIN saja
router.use(adminOnly);

// Route Assignment Logic
router.post('/assign-pengajar', assignPengajar);

// Route AI Knowledge Sync
router.post('/ai-sync', aiSync);

// Route Rekap Laporan & Sertifikat Admin
router.get('/laporan-akhir', getLaporanAkhir);
router.post('/sertifikat/generate', generateSertifikat);

// Route AI Review Queue
router.get('/soal/queue', getSoalQueue);
router.post('/soal/approve', approveSoal);
router.post('/soal/reject', rejectSoal);

// Route AI Knowledge Status
router.get('/ai-knowledge/status', getAIKnowledgeStatus);

module.exports = router;
