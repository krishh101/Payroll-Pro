const express = require('express');
const router = express.Router();
const { getDashboardStats, getPayrollReport } = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

router.get('/dashboard', auth, getDashboardStats);
router.get('/payroll', auth, getPayrollReport);

module.exports = router;
