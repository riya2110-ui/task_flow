import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { Search, Calendar, ChevronRight, Loader2 } from 'lucide-react';

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      const res = await api.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load employee tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Assigned Tasks</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review details, track completion percentage, and submit finished work
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my tasks..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-xs">
            <p className="text-sm font-semibold text-slate-700">No tasks assigned matching criteria</p>
          </div>
        ) : (
          tasks.map((task) => (
            <Link
              key={task._id}
              to={`/employee/tasks/${task._id}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-500/50 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-2">
                  {task.title}
                </h3>

                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeTasks;
