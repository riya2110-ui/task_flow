import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  Play,
  Upload,
  Loader2,
  FileCheck
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/employee');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
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
    assignedTasks: 0,
    inProgress: 0,
    completed: 0,
    dueSoon: 0,
    overdue: 0,
  };

  const statCards = [
    { title: 'Assigned Tasks', value: stats.assignedTasks, icon: CheckSquare, color: 'text-slate-700', bg: 'bg-slate-100' },
    { title: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Due Soon (3 Days)', value: stats.dueSoon, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Workspace</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your assigned deliverables, update task progress, and submit work for employer review
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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

      {/* Active Tasks & Quick Action Shortcuts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Assigned Deliverables</h2>
            <p className="text-xs text-slate-400">Tasks requiring your attention and updates</p>
          </div>
          <Link to="/employee/tasks" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline">
            <span>All My Tasks</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {(data?.recentTasks || []).length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No tasks currently assigned to you.
            </div>
          ) : (
            (data?.recentTasks || []).map((task) => (
              <div key={task._id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/employee/tasks/${task._id}`}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-600"
                    >
                      {task.title}
                    </Link>
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </span>
                    <span>Progress: {task.progress}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/employee/tasks/${task._id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <span>View & Update</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Deadlines Widget */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h2>
          <Link to="/employee/calendar" className="text-xs font-semibold text-emerald-600 hover:underline">
            View Calendar
          </Link>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {(data?.upcomingDeadlines || []).length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No upcoming deadlines.</p>
          ) : (
            (data?.upcomingDeadlines || []).map((task) => (
              <div key={task._id} className="flex items-center justify-between py-2.5">
                <Link
                  to={`/employee/tasks/${task._id}`}
                  className="text-xs font-semibold text-slate-800 hover:text-emerald-600 truncate block pr-2"
                >
                  {task.title}
                </Link>
                <div className="flex items-center gap-3 shrink-0">
                  <PriorityBadge priority={task.priority} />
                  <span className="text-xs text-slate-500">{new Date(task.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
