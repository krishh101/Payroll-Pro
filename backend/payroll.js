const express = require('express');
const router = express.Router();
const { getPayrolls, getPayroll, generatePayroll, updatePayroll, updateStatus, getPayrollStats } = require('../controllers/payrollController');
const { auth, hrAuth } = require('../middleware/auth');

router.get('/stats', auth, getPayrollStats);
router.get('/', auth, getPayrolls);
router.get('/:id', auth, getPayroll);
router.post('/generate', hrAuth, generatePayroll);
router.put('/:id', hrAuth, updatePayroll);
router.patch('/:id/status', hrAuth, updateStatus);

module.exports = router;
