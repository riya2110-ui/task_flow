import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import TaskModal from '../../components/tasks/TaskModal';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Plus,
  ArrowUpRight,
  Calendar,
  Activity,
  Loader2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const EmployerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/employer');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load employer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  };

  const statCards = [
    { title: 'Total Tasks', value: stats.totalTasks, icon: CheckSquare, color: 'text-slate-700', bg: 'bg-slate-100' },
    { title: 'In Progress', value: stats.inProgressTasks, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Overdue Tasks', value: stats.overdueTasks, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Completion Rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Pending (To Do)', value: stats.pendingTasks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employer Overview</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time organizational analytics, workload distribution, and task metrics</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">{card.title}</span>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="mt-2 text-xl font-bold text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Visual Charts: Status & Priority */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution Donut Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Task Status Distribution</h2>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
            <div className="h-48 w-48 sm:h-56 sm:w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.statusChart || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(data?.statusChart || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 sm:mt-0 flex-1 space-y-1.5 pl-0 sm:pl-6 w-full">
              {(data?.statusChart || []).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-600 font-medium">{s.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Tasks by Priority Level</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.priorityChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(data?.priorityChart || []).map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Employee Workload Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Employee Workload Distribution</h2>
            <p className="text-xs text-slate-400">Current task allocation across team members</p>
          </div>
          <Link
            to="/employer/employees"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
          >
            <span>View Team</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.employeeWorkload || []).map((emp) => (
            <div key={emp.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
              <div className="flex items-center gap-2.5">
                <img
                  src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                  alt={emp.name}
                  className="h-9 w-9 rounded-full border border-slate-200 bg-white"
                />
                <div className="flex-1 truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {emp.active} active · {emp.completed} completed
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                  <span>Workload</span>
                  <span>{emp.active} tasks</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, emp.active * 25)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Recent Tasks & Upcoming Deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Recent Tasks</h2>
            <Link to="/employer/tasks" className="text-xs font-semibold text-emerald-600 hover:underline">
              All Tasks
            </Link>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {(data?.recentTasks || []).length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No tasks created yet</p>
            ) : (
              (data?.recentTasks || []).map((task) => (
                <div key={task._id} className="flex items-center justify-between py-2.5">
                  <div className="truncate pr-2">
                    <Link
                      to={`/employer/tasks/${task._id}`}
                      className="text-xs font-bold text-slate-800 hover:text-emerald-600 truncate block"
                    >
                      {task.title}
                    </Link>
                    <span className="text-[10px] text-slate-400">
                      Assigned to {task.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h2>
            <Link to="/employer/calendar" className="text-xs font-semibold text-emerald-600 hover:underline">
              Calendar View
            </Link>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {(data?.upcomingDeadlines || []).length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No upcoming deadlines</p>
            ) : (
              (data?.upcomingDeadlines || []).map((task) => (
                <div key={task._id} className="flex items-center justify-between py-2.5">
                  <div className="truncate pr-2">
                    <Link
                      to={`/employer/tasks/${task._id}`}
                      className="text-xs font-bold text-slate-800 hover:text-emerald-600 truncate block"
                    >
                      {task.title}
                    </Link>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTaskSaved={fetchDashboard}
      />
    </div>
  );
};

export default EmployerDashboard;
