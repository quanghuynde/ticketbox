const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getMyProfile, getUserProfile } = require('../controllers/userController');

// All routes here require token verification
router.use(verifyToken);

router.get('/profile', getMyProfile);
router.get('/profile/:id', getUserProfile);

module.exports = router;
