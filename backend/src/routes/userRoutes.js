const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getMyProfile, getUserProfile, updateProfile, changePassword } = require('../controllers/userController');

// All routes here require token verification
router.use(verifyToken);

router.get('/profile', getMyProfile);
router.get('/profile/:id', getUserProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

module.exports = router;
