const { Task, User, TaskActivity } = require('../models');

// @desc    Get Employer Dashboard metrics & charts data
// @route   GET /api/dashboard/employer
// @access  Private (Employer only)
const getEmployerDashboard = async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    const now = new Date();

    // Aggregated counts
    const totalTasks = await Task.countDocuments({ organizationId: orgId });
    const pendingTasks = await Task.countDocuments({ organizationId: orgId, status: 'TODO' });
    const inProgressTasks = await Task.countDocuments({
      organizationId: orgId,
      status: { $in: ['IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED'] },
    });
    const completedTasks = await Task.countDocuments({ organizationId: orgId, status: 'COMPLETED' });
    const overdueTasks = await Task.countDocuments({
      organizationId: orgId,
      status: { $ne: 'COMPLETED' },
      deadline: { $lt: now },
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Status distribution
    const statusCounts = {
      TODO: pendingTasks,
      IN_PROGRESS: await Task.countDocuments({ organizationId: orgId, status: 'IN_PROGRESS' }),
      SUBMITTED: await Task.countDocuments({ organizationId: orgId, status: 'SUBMITTED' }),
      UNDER_REVIEW: await Task.countDocuments({ organizationId: orgId, status: 'UNDER_REVIEW' }),
      CHANGES_REQUESTED: await Task.countDocuments({ organizationId: orgId, status: 'CHANGES_REQUESTED' }),
      COMPLETED: completedTasks,
    };

    const statusChart = [
      { name: 'To Do', value: statusCounts.TODO, color: '#94a3b8' },
      { name: 'In Progress', value: statusCounts.IN_PROGRESS, color: '#3b82f6' },
      { name: 'Submitted', value: statusCounts.SUBMITTED, color: '#a855f7' },
      { name: 'Under Review', value: statusCounts.UNDER_REVIEW, color: '#f59e0b' },
      { name: 'Changes Req.', value: statusCounts.CHANGES_REQUESTED, color: '#ef4444' },
      { name: 'Completed', value: statusCounts.COMPLETED, color: '#10b981' },
    ];

    // Priority breakdown
    const priorityCounts = {
      LOW: await Task.countDocuments({ organizationId: orgId, priority: 'LOW' }),
      MEDIUM: await Task.countDocuments({ organizationId: orgId, priority: 'MEDIUM' }),
      HIGH: await Task.countDocuments({ organizationId: orgId, priority: 'HIGH' }),
      URGENT: await Task.countDocuments({ organizationId: orgId, priority: 'URGENT' }),
    };

    const priorityChart = [
      { name: 'Low', count: priorityCounts.LOW, color: '#64748b' },
      { name: 'Medium', count: priorityCounts.MEDIUM, color: '#3b82f6' },
      { name: 'High', count: priorityCounts.HIGH, color: '#f59e0b' },
      { name: 'Urgent', count: priorityCounts.URGENT, color: '#ef4444' },
    ];

    // Employee Workload Distribution
    const employees = await User.find({ organizationId: orgId, role: 'EMPLOYEE' }).select('name avatar');
    const employeeWorkload = await Promise.all(
      employees.map(async (emp) => {
        const active = await Task.countDocuments({
          assignedTo: emp._id,
          organizationId: orgId,
          status: { $in: ['TODO', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED'] },
        });
        const completed = await Task.countDocuments({
          assignedTo: emp._id,
          organizationId: orgId,
          status: 'COMPLETED',
        });
        return {
          id: emp._id,
          name: emp.name,
          avatar: emp.avatar,
          active,
          completed,
          total: active + completed,
        };
      })
    );

    // Recent tasks
    const recentTasks = await Task.find({ organizationId: orgId })
      .populate('assignedTo', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(6);

    // Upcoming deadlines (next 7 days, not completed)
    const upcomingDeadlines = await Task.find({
      organizationId: orgId,
      status: { $ne: 'COMPLETED' },
      deadline: { $gte: now },
    })
      .populate('assignedTo', 'name avatar')
      .sort({ deadline: 1 })
      .limit(5);

    // Recent system activity across tasks
    const recentActivity = await TaskActivity.find()
      .populate('taskId', 'title')
      .populate('userId', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        completionRate,
      },
      statusChart,
      priorityChart,
      employeeWorkload,
      recentTasks,
      upcomingDeadlines,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee Dashboard metrics & tasks
// @route   GET /api/dashboard/employee
// @access  Private (Employee only)
const getEmployeeDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orgId = req.organizationId;
    const now = new Date();
    const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    const assignedTasks = await Task.countDocuments({ assignedTo: userId, organizationId: orgId });
    const inProgress = await Task.countDocuments({
      assignedTo: userId,
      organizationId: orgId,
      status: { $in: ['IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED'] },
    });
    const completed = await Task.countDocuments({
      assignedTo: userId,
      organizationId: orgId,
      status: 'COMPLETED',
    });
    const dueSoon = await Task.countDocuments({
      assignedTo: userId,
      organizationId: orgId,
      status: { $ne: 'COMPLETED' },
      deadline: { $gte: now, $lte: soon },
    });
    const overdue = await Task.countDocuments({
      assignedTo: userId,
      organizationId: orgId,
      status: { $ne: 'COMPLETED' },
      deadline: { $lt: now },
    });

    const recentTasks = await Task.find({ assignedTo: userId, organizationId: orgId })
      .populate('createdBy', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(5);

    const upcomingDeadlines = await Task.find({
      assignedTo: userId,
      organizationId: orgId,
      status: { $ne: 'COMPLETED' },
      deadline: { $gte: now },
    })
      .sort({ deadline: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        assignedTasks,
        inProgress,
        completed,
        dueSoon,
        overdue,
      },
      recentTasks,
      upcomingDeadlines,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployerDashboard,
  getEmployeeDashboard,
};
