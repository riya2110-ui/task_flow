import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    TODO: 'bg-slate-100 text-slate-700 border-slate-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    SUBMITTED: 'bg-purple-50 text-purple-700 border-purple-200',
    UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    CHANGES_REQUESTED: 'bg-red-50 text-red-700 border-red-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const labels = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    CHANGES_REQUESTED: 'Changes Requested',
    COMPLETED: 'Completed',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-blue-50 text-blue-700',
    HIGH: 'bg-amber-50 text-amber-700',
    URGENT: 'bg-red-50 text-red-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
        styles[priority] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {priority}
    </span>
  );
};
