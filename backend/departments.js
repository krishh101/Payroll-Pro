const express = require('express');
const router = express.Router();
const { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { auth, hrAuth, adminAuth } = require('../middleware/auth');

router.get('/', auth, getDepartments);
router.get('/:id', auth, getDepartment);
router.post('/', hrAuth, createDepartment);
router.put('/:id', hrAuth, updateDepartment);
router.delete('/:id', adminAuth, deleteDepartment);

module.exports = router;
