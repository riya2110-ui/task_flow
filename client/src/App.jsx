import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import EmployerTasks from './pages/employer/Tasks';
import EmployerEmployees from './pages/employer/Employees';
import EmployerAnalytics from './pages/employer/Analytics';
import EmployerSettings from './pages/employer/Settings';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeTasks from './pages/employee/Tasks';
import EmployeeProfile from './pages/employee/Profile';

// Shared Components for Routes
import TaskDetailView from './components/tasks/TaskDetailView';
import CalendarView from './components/common/CalendarView';

// Root redirector based on authenticated user's role
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return user.role === 'EMPLOYER' ? (
    <Navigate to="/employer/dashboard" replace />
  ) : (
    <Navigate to="/employee/dashboard" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Employer Routes */}
          <Route
            path="/employer"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYER']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/employer/dashboard" replace />} />
            <Route path="dashboard" element={<EmployerDashboard />} />
            <Route path="tasks" element={<EmployerTasks />} />
            <Route path="tasks/:id" element={<TaskDetailView />} />
            <Route path="employees" element={<EmployerEmployees />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="analytics" element={<EmployerAnalytics />} />
            <Route path="settings" element={<EmployerSettings />} />
          </Route>

          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="tasks" element={<EmployeeTasks />} />
            <Route path="tasks/:id" element={<TaskDetailView />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="profile" element={<EmployeeProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
