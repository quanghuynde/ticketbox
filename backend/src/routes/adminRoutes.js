const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');

// All routes here require verification and admin privileges
router.use(verifyToken);
router.use(isAdmin);

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
