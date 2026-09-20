import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, UserPlus, Mail, CheckCircle2, Clock, X, Loader2, AlertCircle } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Invite Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.employees || []);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setInviting(true);

    try {
      const res = await api.post('/employees/invite', { name, email, password });
      if (res.data.success) {
        setSuccessMsg(`Employee ${name} added successfully!`);
        setName('');
        setEmail('');
        setPassword('password123');
        fetchEmployees();
        setTimeout(() => {
          setModalOpen(false);
          setSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite employee');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage employees, track workloads, and invite new members</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setSuccessMsg('');
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Employee</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : employees.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-xs">
            <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No employees added yet</p>
            <p className="mt-1 text-xs text-slate-400">Click "Invite Employee" to add team members to your organization</p>
          </div>
        ) : (
          employees.map((emp) => (
            <div
              key={emp._id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                    alt={emp.name}
                    className="h-12 w-12 rounded-full border border-slate-200 bg-slate-50"
                  />
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{emp.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 truncate mt-0.5">
                      <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-center">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Active Tasks
                    </span>
                    <span className="text-base font-bold text-slate-900">{emp.activeTasksCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Completed
                    </span>
                    <span className="text-base font-bold text-emerald-600">{emp.completedTasksCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                Joined on {new Date(emp.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invite Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Invite New Employee</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Taylor Smith"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Employee Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="taylor@company.com"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                >
                  {inviting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
