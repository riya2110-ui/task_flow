const { User, Task } = require('../models');

// @desc    Get all employees in the current organization
// @route   GET /api/employees
// @access  Private (Employer & Employee)
const getEmployees = async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) {
      return res.status(400).json({ success: false, message: 'No organization linked.' });
    }

    const employees = await User.find({
      organizationId: orgId,
      role: 'EMPLOYEE',
    }).select('-password').sort({ name: 1 });

    // Calculate active tasks count for each employee
    const employeesWithStats = await Promise.all(
      employees.map(async (emp) => {
        const activeTasksCount = await Task.countDocuments({
          assignedTo: emp._id,
          status: { $in: ['TODO', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED'] },
        });
        const completedTasksCount = await Task.countDocuments({
          assignedTo: emp._id,
          status: 'COMPLETED',
        });
        return {
          ...emp.toObject(),
          activeTasksCount,
          completedTasksCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: employeesWithStats.length,
      employees: employeesWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee details & workload stats
// @route   GET /api/employees/:id
// @access  Private (Employer & Employee)
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    }).select('-password');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const tasks = await Task.find({
      assignedTo: employee._id,
      organizationId: req.organizationId,
    }).sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      employee,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add / invite employee to organization
// @route   POST /api/employees/invite
// @access  Private (Employer only)
const inviteEmployee = async (req, res, next) => {
  try {
    const { name, email, password = 'password123' } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const newEmployee = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'EMPLOYEE',
      organizationId: req.organizationId,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    res.status(201).json({
      success: true,
      message: `Employee ${newEmployee.name} created successfully.`,
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        avatar: newEmployee.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  inviteEmployee,
};
