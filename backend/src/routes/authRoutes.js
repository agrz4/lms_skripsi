const express = require('express');
const router = express.Router();
const { login, register, getMe, updateProfile, getDemoUsers } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/demo-users', getDemoUsers);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
