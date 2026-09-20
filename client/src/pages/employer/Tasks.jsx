import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import TaskModal from '../../components/tasks/TaskModal';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  ExternalLink,
  AlertCircle,
  Loader2,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await api.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task? This will remove all associated comments and activity.')) {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks((prev) => prev.filter((t) => t._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">Manage, assign, and track project tasks across your team</p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title..."
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

      {/* Tasks Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">No tasks found</p>
            <p className="mt-1 text-xs text-slate-400">Create your first task or change filter criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Assignee</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3">Deadline</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/employer/tasks/${task._id}`}
                        className="font-semibold text-slate-900 hover:text-emerald-600 block text-sm"
                      >
                        {task.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        {task.description || 'No description provided'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignedTo?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignedTo?.name}`}
                          alt={task.assignedTo?.name}
                          className="h-6 w-6 rounded-full border border-slate-200"
                        />
                        <span className="font-medium text-slate-800">{task.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>{task.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/employer/tasks/${task._id}`}
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="View Details"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setIsModalOpen(true);
                          }}
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Edit Task"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete Task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onTaskSaved={fetchTasks}
        initialData={editingTask}
      />
    </div>
  );
};

export default Tasks;
