require('dotenv').config();
const mongoose = require('mongoose');
const { User, Organization, Task, Comment, Notification, TaskActivity } = require('./models');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await TaskActivity.deleteMany({});

    console.log('Cleared old database records.');

    // 1. Create Organization
    const tempOrgId = new mongoose.Types.ObjectId();
    const employer = await User.create({
      name: 'John Employer',
      email: 'john@example.com',
      password: 'password123',
      role: 'EMPLOYER',
      organizationId: tempOrgId,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnEmployer',
    });

    const org = await Organization.create({
      _id: tempOrgId,
      name: 'Acme Corp',
      ownerId: employer._id,
    });

    console.log('Created Employer and Organization:', org.name);

    // 2. Create Employees
    const employee1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'employee@example.com',
      password: 'password123',
      role: 'EMPLOYEE',
      organizationId: org._id,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahJenkins',
    });

    const employee2 = await User.create({
      name: 'David Miller',
      email: 'david@example.com',
      password: 'password123',
      role: 'EMPLOYEE',
      organizationId: org._id,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidMiller',
    });

    console.log('Created Employees:', employee1.name, employee2.name);

    // 3. Create Sample Tasks
    const now = new Date();
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const pastYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Task 1: COMPLETED
    const task1 = await Task.create({
      title: 'Design Landing Page UI',
      description: 'Create high-fidelity mockups in Figma for modern SaaS landing page, mobile and desktop responsive layouts.',
      createdBy: employer._id,
      assignedTo: employee1._id,
      organizationId: org._id,
      status: 'COMPLETED',
      priority: 'HIGH',
      deadline: pastYesterday,
      estimatedHours: 12,
      progress: 100,
      completedAt: now,
    });

    // Task 2: IN_PROGRESS
    const task2 = await Task.create({
      title: 'Implement Payment Gateway Integration',
      description: 'Integrate Stripe billing API and webhook listeners for subscription management and invoice tracking.',
      createdBy: employer._id,
      assignedTo: employee1._id,
      organizationId: org._id,
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      deadline: inThreeDays,
      estimatedHours: 16,
      progress: 60,
    });

    // Task 3: SUBMITTED (Ready for Employer Review!)
    const task3 = await Task.create({
      title: 'Prepare Security Audit Report',
      description: 'Execute vulnerability scans and prepare compliance documentation for SOC2 readiness assessment.',
      createdBy: employer._id,
      assignedTo: employee2._id,
      organizationId: org._id,
      status: 'SUBMITTED',
      priority: 'HIGH',
      deadline: inFiveDays,
      estimatedHours: 8,
      progress: 100,
      submissionNotes: 'Completed penetration testing scans and attached final findings summary. All high risks remediated.',
      attachments: [
        { name: 'Security-Audit-Summary.pdf', url: 'https://example.com/reports/security-audit.pdf' }
      ]
    });

    // Task 4: TODO
    const task4 = await Task.create({
      title: 'Optimize Database Query Indices',
      description: 'Analyze slow query logs in MongoDB and create compound indices on task and user collection queries.',
      createdBy: employer._id,
      assignedTo: employee2._id,
      organizationId: org._id,
      status: 'TODO',
      priority: 'MEDIUM',
      deadline: inFiveDays,
      estimatedHours: 6,
      progress: 0,
    });

    // Task 5: CHANGES_REQUESTED
    const task5 = await Task.create({
      title: 'Setup CI/CD Pipeline with GitHub Actions',
      description: 'Automate build, lint, and test runner upon pull request creation.',
      createdBy: employer._id,
      assignedTo: employee1._id,
      organizationId: org._id,
      status: 'CHANGES_REQUESTED',
      priority: 'MEDIUM',
      deadline: inThreeDays,
      estimatedHours: 10,
      progress: 80,
    });

    console.log('Created 5 Tasks with varied statuses and priorities.');

    // 4. Create Activity & Comments for Task 2 and Task 3
    await TaskActivity.create([
      {
        taskId: task2._id,
        userId: employer._id,
        action: 'CREATED',
        oldValue: '',
        newValue: 'Task created and assigned to Sarah Jenkins',
      },
      {
        taskId: task2._id,
        userId: employee1._id,
        action: 'STATUS_CHANGED',
        oldValue: 'TODO',
        newValue: 'IN_PROGRESS',
      },
      {
        taskId: task2._id,
        userId: employee1._id,
        action: 'PROGRESS_UPDATED',
        oldValue: '0%',
        newValue: '60%',
      },
      {
        taskId: task3._id,
        userId: employee2._id,
        action: 'SUBMITTED',
        oldValue: 'IN_PROGRESS',
        newValue: 'SUBMITTED',
      },
    ]);

    await Comment.create([
      {
        taskId: task2._id,
        userId: employee1._id,
        message: 'Stripe webhook secrets are set up in sandbox. Testing idempotency keys next.',
      },
      {
        taskId: task2._id,
        userId: employer._id,
        message: 'Great progress Sarah. Make sure to test failure scenarios as well.',
      },
      {
        taskId: task3._id,
        userId: employee2._id,
        message: 'I have uploaded the final audit report for review. Please check the attachment.',
      },
    ]);

    await Notification.create([
      {
        userId: employer._id,
        taskId: task3._id,
        type: 'TASK_SUBMITTED',
        message: 'David Miller submitted work for review on "Prepare Security Audit Report".',
      },
      {
        userId: employee1._id,
        taskId: task2._id,
        type: 'TASK_ASSIGNED',
        message: 'You have been assigned a new task: "Implement Payment Gateway Integration"',
      },
    ]);

    console.log('Created Comments, Activities, and Notifications.');
    console.log('\n=========================================');
    console.log('DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('Employer: john@example.com / password123');
    console.log('Employee: employee@example.com / password123');
    console.log('=========================================');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
