const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById, inviteEmployee } = require('../controllers/employeeController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/invite', requireRole('EMPLOYER'), inviteEmployee);

module.exports = router;
