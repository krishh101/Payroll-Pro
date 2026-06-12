const express = require('express');
const router = express.Router();
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getStats } = require('../controllers/employeeController');
const { auth, hrAuth, adminAuth } = require('../middleware/auth');

router.get('/stats', auth, getStats);
router.get('/', auth, getEmployees);
router.get('/:id', auth, getEmployee);
router.post('/', hrAuth, createEmployee);
router.put('/:id', hrAuth, updateEmployee);
router.delete('/:id', adminAuth, deleteEmployee);

module.exports = router;
