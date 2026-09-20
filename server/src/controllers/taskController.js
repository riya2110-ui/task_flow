const { Task, TaskActivity, Notification, Comment, User } = require('../models');

// Helper to record activity
const logActivity = async (taskId, userId, action, oldValue = '', newValue = '') => {
  try {
    await TaskActivity.create({
      taskId,
      userId,
      action,
      oldValue,
      newValue,
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// Helper to create notification
const createNotification = async (userId, taskId, type, message) => {
  try {
    await Notification.create({
      userId,
      taskId,
      type,
      message,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) {
      return res.status(400).json({ success: false, message: 'No organization linked.' });
    }

    const filter = { organizationId: orgId };

    // Role-based scoping: Employees only see tasks assigned to them
    if (req.user.role === 'EMPLOYEE') {
      filter.assignedTo = req.user._id;
    }

    // Additional query filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.assignedTo && req.user.role === 'EMPLOYER') {
      filter.assignedTo = req.query.assignedTo;
    }
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('organizationId', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Enforce organization isolation
    if (task.organizationId._id.toString() !== req.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Cross-organization access denied.' });
    }

    // Enforce employee isolation: Employee can only view tasks assigned to them or created by them
    if (
      req.user.role === 'EMPLOYEE' &&
      task.assignedTo._id.toString() !== req.user._id.toString() &&
      task.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Forbidden. You cannot view tasks assigned to other employees.' });
    }

    // Fetch activities & comments
    const activities = await TaskActivity.find({ taskId: task._id })
      .populate('userId', 'name avatar role')
      .sort({ createdAt: -1 });

    const comments = await Comment.find({ taskId: task._id })
      .populate('userId', 'name avatar role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      task,
      activities,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Employer only)
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority = 'MEDIUM', deadline, estimatedHours = 0 } = req.body;

    if (!title || !assignedTo || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, assigned employee, and deadline are required.',
      });
    }

    // Verify assigned user belongs to the same organization
    const employee = await User.findOne({ _id: assignedTo, organizationId: req.organizationId });
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Assigned employee is not a member of your organization.',
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      createdBy: req.user._id,
      assignedTo,
      organizationId: req.organizationId,
      status: 'TODO',
      priority,
      deadline,
      estimatedHours,
      progress: 0,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    // Activity log
    await logActivity(task._id, req.user._id, 'CREATED', '', `Created task "${task.title}"`);

    // Notification for assignee
    await createNotification(
      assignedTo,
      task._id,
      'TASK_ASSIGNED',
      `You were assigned a new task: "${task.title}" by ${req.user.name}`
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details (Employer only)
// @route   PUT /api/tasks/:id
// @access  Private (Employer only)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const { title, description, assignedTo, priority, deadline, estimatedHours } = req.body;

    if (assignedTo && assignedTo.toString() !== task.assignedTo.toString()) {
      const newAssignee = await User.findOne({ _id: assignedTo, organizationId: req.organizationId });
      if (!newAssignee) {
        return res.status(400).json({ success: false, message: 'New assignee is not in your organization.' });
      }
      await logActivity(task._id, req.user._id, 'REASSIGNED', task.assignedTo.toString(), assignedTo.toString());
      await createNotification(
        assignedTo,
        task._id,
        'TASK_ASSIGNED',
        `Task "${task.title}" was reassigned to you by ${req.user.name}`
      );
      task.assignedTo = assignedTo;
    }

    if (priority && priority !== task.priority) {
      await logActivity(task._id, req.user._id, 'PRIORITY_CHANGED', task.priority, priority);
      task.priority = priority;
    }

    if (deadline && new Date(deadline).toISOString() !== new Date(task.deadline).toISOString()) {
      await logActivity(task._id, req.user._id, 'DEADLINE_CHANGED', task.deadline.toISOString(), new Date(deadline).toISOString());
      task.deadline = deadline;
    }

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task (Employer only)
// @route   DELETE /api/tasks/:id
// @access  Private (Employer only)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await Task.deleteOne({ _id: task._id });
    await TaskActivity.deleteMany({ taskId: task._id });
    await Comment.deleteMany({ taskId: task._id });
    await Notification.deleteMany({ taskId: task._id });

    res.status(200).json({
      success: true,
      message: 'Task and associated data deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PHASE 6: WORKFLOW & STATUS TRANSITIONS
// ==========================================

// Allowed transitions:
// TODO -> IN_PROGRESS (Employee / Employer)
// IN_PROGRESS -> SUBMITTED (Employee submits work)
// SUBMITTED -> UNDER_REVIEW (Employer)
// UNDER_REVIEW -> COMPLETED (Employer approves)
// UNDER_REVIEW -> CHANGES_REQUESTED (Employer rejects)
// CHANGES_REQUESTED -> IN_PROGRESS (Employee resumes)
const isValidTransition = (currentStatus, newStatus, role) => {
  if (role === 'EMPLOYER') {
    // Employer can move across any valid flow
    const transitions = {
      TODO: ['IN_PROGRESS'],
      IN_PROGRESS: ['SUBMITTED', 'UNDER_REVIEW', 'COMPLETED'],
      SUBMITTED: ['UNDER_REVIEW', 'COMPLETED', 'CHANGES_REQUESTED'],
      UNDER_REVIEW: ['COMPLETED', 'CHANGES_REQUESTED'],
      CHANGES_REQUESTED: ['IN_PROGRESS'],
      COMPLETED: ['IN_PROGRESS'],
    };
    return transitions[currentStatus]?.includes(newStatus) || false;
  } else {
    // Employee restricted transitions
    const employeeTransitions = {
      TODO: ['IN_PROGRESS'],
      IN_PROGRESS: ['SUBMITTED'],
      CHANGES_REQUESTED: ['IN_PROGRESS'],
    };
    return employeeTransitions[currentStatus]?.includes(newStatus) || false;
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, organizationId: req.organizationId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Role check: Employee can only update own task
    if (req.user.role === 'EMPLOYEE' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own assigned tasks.' });
    }

    if (!isValidTransition(task.status, status, req.user.role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${task.status} to ${status} for role ${req.user.role}.`,
      });
    }

    const oldStatus = task.status;
    task.status = status;

    if (status === 'COMPLETED') {
      task.progress = 100;
      task.completedAt = new Date();
    } else if (status === 'IN_PROGRESS' && task.progress === 0) {
      task.progress = 10;
    }

    await task.save();

    await logActivity(task._id, req.user._id, 'STATUS_CHANGED', oldStatus, status);

    // Notify relevant party
    const targetUserId = req.user.role === 'EMPLOYER' ? task.assignedTo : task.createdBy;
    await createNotification(
      targetUserId,
      task._id,
      'TASK_STATUS_UPDATED',
      `${req.user.name} changed status of "${task.title}" to ${status}`
    );

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task progress percentage
// @route   PATCH /api/tasks/:id/progress
// @access  Private
const updateTaskProgress = async (req, res, next) => {
  try {
    const { progress } = req.body;
    const numProgress = Number(progress);

    if (isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
      return res.status(400).json({ success: false, message: 'Progress must be a number between 0 and 100.' });
    }

    const task = await Task.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Role check
    if (req.user.role === 'EMPLOYEE' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update your own assigned tasks.' });
    }

    const oldProgress = task.progress;
    task.progress = numProgress;

    // If task was TODO and progress increased, auto move to IN_PROGRESS
    if (task.status === 'TODO' && numProgress > 0) {
      task.status = 'IN_PROGRESS';
    }

    await task.save();

    await logActivity(task._id, req.user._id, 'PROGRESS_UPDATED', `${oldProgress}%`, `${numProgress}%`);

    res.status(200).json({
      success: true,
      message: `Progress updated to ${numProgress}%.`,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee submits work for review
// @route   POST /api/tasks/:id/submit
// @access  Private (Employee or Employer)
const submitTask = async (req, res, next) => {
  try {
    const { submissionNotes, attachments = [] } = req.body;
    const task = await Task.findOne({ _id: req.params.id, organizationId: req.organizationId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (req.user.role === 'EMPLOYEE' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only submit your own tasks.' });
    }

    const oldStatus = task.status;
    task.status = 'SUBMITTED';
    task.progress = 100;
    if (submissionNotes) task.submissionNotes = submissionNotes;
    if (attachments && attachments.length > 0) {
      task.attachments = [...task.attachments, ...attachments];
    }

    await task.save();

    await logActivity(task._id, req.user._id, 'SUBMITTED', oldStatus, 'SUBMITTED');

    // Notify the employer who created the task
    await createNotification(
      task.createdBy,
      task._id,
      'TASK_SUBMITTED',
      `${req.user.name} submitted work for review on "${task.title}".`
    );

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    res.status(200).json({
      success: true,
      message: 'Task submitted for review successfully.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Employer reviews submission: Approve (COMPLETED) or Request Changes (CHANGES_REQUESTED)
// @route   POST /api/tasks/:id/review
// @access  Private (Employer only)
const reviewTask = async (req, res, next) => {
  try {
    const { action, feedback } = req.body; // action: 'APPROVE' or 'REQUEST_CHANGES'

    if (!['APPROVE', 'REQUEST_CHANGES'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Review action must be either "APPROVE" or "REQUEST_CHANGES".',
      });
    }

    const task = await Task.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const oldStatus = task.status;
    if (action === 'APPROVE') {
      task.status = 'COMPLETED';
      task.progress = 100;
      task.completedAt = new Date();

      await logActivity(task._id, req.user._id, 'APPROVED', oldStatus, 'COMPLETED');
      await createNotification(
        task.assignedTo,
        task._id,
        'TASK_REVIEWED',
        `Great job! ${req.user.name} approved your task "${task.title}".`
      );
    } else {
      task.status = 'CHANGES_REQUESTED';
      task.progress = Math.min(task.progress, 80);

      await logActivity(task._id, req.user._id, 'CHANGES_REQUESTED', oldStatus, 'CHANGES_REQUESTED');
      await createNotification(
        task.assignedTo,
        task._id,
        'TASK_REVIEWED',
        `Changes requested by ${req.user.name} on "${task.title}": ${feedback || 'Please see details'}`
      );
    }

    await task.save();

    // If feedback provided, also post as comment
    if (feedback) {
      await Comment.create({
        taskId: task._id,
        userId: req.user._id,
        message: `[Review Feedback - ${action}]: ${feedback}`,
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    res.status(200).json({
      success: true,
      message: action === 'APPROVE' ? 'Task approved and marked COMPLETED.' : 'Changes requested on task.',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PHASE 8: COMMENTS & TIMELINE
// ==========================================

// @desc    Get all comments for a task
// @route   GET /api/tasks/:id/comments
// @access  Private
const getTaskComments = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const comments = await Comment.find({ taskId: task._id })
      .populate('userId', 'name email avatar role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addTaskComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Comment message is required.' });
    }

    const task = await Task.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const comment = await Comment.create({
      taskId: task._id,
      userId: req.user._id,
      message: message.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate('userId', 'name email avatar role');

    await logActivity(task._id, req.user._id, 'COMMENT_ADDED', '', 'Added a comment');

    // Notify the other user (if sender is employee -> notify creator, if sender is employer -> notify assignee)
    const targetUserId = req.user._id.toString() === task.assignedTo.toString() ? task.createdBy : task.assignedTo;
    await createNotification(
      targetUserId,
      task._id,
      'COMMENT_ADDED',
      `${req.user.name} commented on "${task.title}": "${message.slice(0, 50)}..."`
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
