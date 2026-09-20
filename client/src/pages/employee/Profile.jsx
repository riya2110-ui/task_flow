import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, ShieldCheck, Briefcase } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Review your personal employee account details</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="h-16 w-16 rounded-full border border-slate-200 bg-slate-50"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="mt-1 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Workspace Membership</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400">Organization</span>
              <p className="mt-1 text-sm font-bold text-slate-900">{user?.organization?.name || 'TaskFlow Org'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400">Role Status</span>
              <p className="mt-1 text-sm font-bold text-slate-900">Active Employee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
