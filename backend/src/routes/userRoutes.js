const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.use(authMiddleware);
router.use(adminOnly);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
