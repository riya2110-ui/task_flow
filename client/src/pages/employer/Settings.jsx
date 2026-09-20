import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Shield, User } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage organization details and account preferences</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Organization Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400">Organization Name</span>
              <p className="mt-1 text-sm font-bold text-slate-900">{user?.organization?.name || 'TaskFlow Workspace'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400">Workspace ID</span>
              <p className="mt-1 text-xs font-mono text-slate-600 truncate">{user?.organization?.id || user?.organizationId || 'Default'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-sm font-bold text-slate-900">Administrator Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="h-14 w-14 rounded-full border border-slate-200 bg-slate-50"
            />
            <div>
              <p className="text-base font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="mt-1 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
