import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Calendar,
  BarChart3,
  Settings,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Building2,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isEmployer = user?.role === 'EMPLOYER';

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount((res.data.notifications || []).filter((n) => !n.isRead).length);
      }
    } catch {
      // Notifications might not exist yet before phase 8
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employerLinks = [
    { name: 'Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/employer/tasks', icon: CheckSquare },
    { name: 'Employees', path: '/employer/employees', icon: Users },
    { name: 'Calendar', path: '/employer/calendar', icon: Calendar },
    { name: 'Analytics', path: '/employer/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/employer/settings', icon: Settings },
  ];

  const employeeLinks = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', path: '/employee/tasks', icon: CheckSquare },
    { name: 'Calendar', path: '/employee/calendar', icon: Calendar },
    { name: 'Profile', path: '/employee/profile', icon: User },
  ];

  const navLinks = isEmployer ? employerLinks : employeeLinks;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-500/20">
              <CheckSquare className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Task<span className="text-emerald-600">Flow</span></span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">Workspace</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organization Tag */}
        <div className="mx-4 my-4 rounded-lg bg-slate-50 p-3 border border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.organization?.name || 'TaskFlow Org'}
              </p>
              <p className="text-[11px] text-slate-500 capitalize">
                {user?.role?.toLowerCase()} workspace
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card Footer */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt={user?.name}
                className="h-8 w-8 rounded-full border border-slate-200 bg-white"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <span className="inline-block rounded bg-slate-200/70 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-slate-700 uppercase">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-red-600 hover:shadow-xs transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-slate-800 hidden sm:block">
              {navLinks.find((l) => location.pathname === l.path || location.pathname.startsWith(l.path + '/'))?.name || 'TaskFlow'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 py-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkAsRead(n._id)}
                          className={`flex items-start gap-3 p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !n.isRead ? 'bg-emerald-50/40 font-medium' : 'text-slate-600'
                          }`}
                        >
                          <div className="mt-0.5">
                            {!n.isRead ? (
                              <div className="h-2 w-2 rounded-full bg-emerald-600" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-slate-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-800">{n.message}</p>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 transition"
              >
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full border border-slate-200 bg-white"
                />
                <div className="hidden text-left md:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="mt-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                      {user?.role}
                    </span>
                  </div>
                  <NavLink
                    to={isEmployer ? '/employer/settings' : '/employee/profile'}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    Profile & Settings
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
