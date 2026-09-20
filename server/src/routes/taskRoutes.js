const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskProgress,
  submitTask,
  reviewTask,
  getTaskComments,
  addTaskComment,
} = require('../controllers/taskController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

// CRUD
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', requireRole('EMPLOYER'), createTask);
router.put('/:id', requireRole('EMPLOYER'), updateTask);
router.delete('/:id', requireRole('EMPLOYER'), deleteTask);

// Status & Progress Workflow
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/progress', updateTaskProgress);
router.post('/:id/submit', submitTask);
router.post('/:id/review', requireRole('EMPLOYER'), reviewTask);

// Comments
router.get('/:id/comments', getTaskComments);
router.post('/:id/comments', addTaskComment);

module.exports = router;
