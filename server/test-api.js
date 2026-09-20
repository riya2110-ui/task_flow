const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('--- STARTING TASKFLOW INTEGRATION TESTS ---');
  const timestamp = Date.now();

  try {
    // 1. Register Employer
    console.log('1. Registering Employer...');
    const empRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: `Employer Boss ${timestamp}`,
      email: `employer_${timestamp}@taskflow.test`,
      password: 'password123',
      role: 'EMPLOYER',
      organizationName: `Apex Dynamics ${timestamp}`,
    });
    const employerToken = empRes.data.token;
    const orgId = empRes.data.user.organization.id;
    console.log('   ✓ Employer registered:', empRes.data.user.name, 'Org:', orgId);

    const employerClient = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${employerToken}` },
    });

    // 2. Invite Employee
    console.log('2. Inviting Employee...');
    const invRes = await employerClient.post('/employees/invite', {
      name: `Worker Bee ${timestamp}`,
      email: `worker_${timestamp}@taskflow.test`,
      password: 'password123',
    });
    const employeeId = invRes.data.employee.id;
    console.log('   ✓ Employee invited:', invRes.data.employee.name, 'ID:', employeeId);

    // 3. Login as Employee
    console.log('3. Logging in as Employee...');
    const workerLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: `worker_${timestamp}@taskflow.test`,
      password: 'password123',
    });
    const employeeToken = workerLogin.data.token;
    console.log('   ✓ Employee logged in successfully.');

    const employeeClient = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${employeeToken}` },
    });

    // 4. Create Task as Employer
    console.log('4. Creating Task as Employer...');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const taskRes = await employerClient.post('/tasks', {
      title: 'Build Authentication Module',
      description: 'Implement JWT authentication and security headers.',
      assignedTo: employeeId,
      priority: 'HIGH',
      deadline: tomorrow,
      estimatedHours: 8,
    });
    const taskId = taskRes.data.task._id;
    console.log('   ✓ Task created with ID:', taskId, 'Status:', taskRes.data.task.status);

    // 5. Employee views assigned tasks
    console.log('5. Employee fetching tasks...');
    const empTasks = await employeeClient.get('/tasks');
    if (empTasks.data.tasks.length !== 1 || empTasks.data.tasks[0]._id !== taskId) {
      throw new Error('Employee task list does not match assigned task');
    }
    console.log('   ✓ Employee received assigned task count:', empTasks.data.count);

    // 6. Employee updates status to IN_PROGRESS
    console.log('6. Employee updating status to IN_PROGRESS...');
    const statusRes = await employeeClient.patch(`/tasks/${taskId}/status`, { status: 'IN_PROGRESS' });
    console.log('   ✓ Task status updated to:', statusRes.data.task.status);

    // 7. Employee updates progress to 65%
    console.log('7. Employee updating progress to 65%...');
    const progRes = await employeeClient.patch(`/tasks/${taskId}/progress`, { progress: 65 });
    console.log('   ✓ Progress updated to:', progRes.data.task.progress + '%');

    // 8. Employee submits task for review
    console.log('8. Employee submitting work for review...');
    const submitRes = await employeeClient.post(`/tasks/${taskId}/submit`, {
      submissionNotes: 'Completed JWT authentication and verified all tests.',
      attachments: [{ name: 'auth-spec.pdf', url: 'https://example.com/auth-spec.pdf' }],
    });
    console.log('   ✓ Task submitted! Status:', submitRes.data.task.status);

    // 9. Employer reviews submission and approves
    console.log('9. Employer reviewing and approving submission...');
    const reviewRes = await employerClient.post(`/tasks/${taskId}/review`, {
      action: 'APPROVE',
      feedback: 'Excellent work! Code quality meets standard.',
    });
    console.log('   ✓ Task reviewed! Final status:', reviewRes.data.task.status, 'CompletedAt:', !!reviewRes.data.task.completedAt);

    // 10. Add Comment & retrieve timeline
    console.log('10. Adding and reading task comments...');
    await employerClient.post(`/tasks/${taskId}/comments`, {
      message: 'Looking forward to the next milestone!',
    });
    const commentsRes = await employeeClient.get(`/tasks/${taskId}/comments`);
    console.log('   ✓ Comments count:', commentsRes.data.count);

    // 11. Employer Dashboard stats
    console.log('11. Verifying Employer Dashboard metrics...');
    const employerDash = await employerClient.get('/dashboard/employer');
    console.log('   ✓ Employer stats:', employerDash.data.stats);
    console.log('   ✓ Priority chart items:', employerDash.data.priorityChart.length);
    console.log('   ✓ Employee workload entries:', employerDash.data.employeeWorkload.length);

    // 12. Employee Dashboard stats
    console.log('12. Verifying Employee Dashboard metrics...');
    const employeeDash = await employeeClient.get('/dashboard/employee');
    console.log('   ✓ Employee stats:', employeeDash.data.stats);

    // 13. Notifications check
    console.log('13. Checking notifications...');
    const notifs = await employeeClient.get('/notifications');
    console.log('   ✓ Employee notifications received:', notifs.data.count);
    if (notifs.data.notifications.length > 0) {
      await employeeClient.patch(`/notifications/${notifs.data.notifications[0]._id}/read`);
      console.log('   ✓ Notification marked as read.');
    }

    // 14. Security test: Employee cannot create task
    console.log('14. Testing security: Employee trying to create task (Expect 403)...');
    try {
      await employeeClient.post('/tasks', {
        title: 'Unauthorized Task',
        assignedTo: employeeId,
        deadline: tomorrow,
      });
      throw new Error('Security failure: Employee was able to create task!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('   ✓ Security verified: Employee rejected with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    console.log('\n=========================================');
    console.log('ALL BACKEND INTEGRATION TESTS PASSED 100%!');
    console.log('=========================================');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
