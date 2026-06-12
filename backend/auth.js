// routes/auth.js
const express = require('express');
const router = express.Router();
const { login, getProfile, register, changePassword } = require('../controllers/authController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/login', login);
router.get('/profile', auth, getProfile);
router.post('/register', auth, adminAuth, register);
router.put('/change-password', auth, changePassword);

module.exports = router;
