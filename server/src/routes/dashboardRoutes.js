const express = require('express');
const router = express.Router();
const { getEmployerDashboard, getEmployeeDashboard } = require('../controllers/dashboardController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.get('/employer', requireRole('EMPLOYER'), getEmployerDashboard);
router.get('/employee', requireRole('EMPLOYEE'), getEmployeeDashboard);

module.exports = router;
