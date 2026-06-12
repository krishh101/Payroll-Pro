const express = require('express');
const router = express.Router();
const { getLeaves, getLeave, createLeave, updateLeaveStatus, deleteLeave, getLeaveStats } = require('../controllers/leaveController');
const { auth, hrAuth } = require('../middleware/auth');

router.get('/stats', auth, getLeaveStats);
router.get('/', auth, getLeaves);
router.get('/:id', auth, getLeave);
router.post('/', auth, createLeave);
router.patch('/:id/status', hrAuth, updateLeaveStatus);
router.delete('/:id', hrAuth, deleteLeave);

module.exports = router;
