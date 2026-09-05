const express = require('express');
const router = express.Router();
const {
  getAllPaket,
  createPaket,
  updatePaket,
  addCourseToPaket,
  removeCourseFromPaket,
  deletePaket
} = require('../controllers/paketController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAllPaket);
router.post('/', authMiddleware, adminOnly, createPaket);
router.put('/:id', authMiddleware, adminOnly, updatePaket);
router.post('/:id/courses', authMiddleware, adminOnly, addCourseToPaket);
router.delete('/:id/courses/:courseId', authMiddleware, adminOnly, removeCourseFromPaket);
router.delete('/:id', authMiddleware, adminOnly, deletePaket);

module.exports = router;

