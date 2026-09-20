import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './Badges';

const CalendarView = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isEmployer = user?.role === 'EMPLOYER';

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tasks');
        if (res.data.success) {
          setTasks(res.data.tasks || []);
        }
      } catch (err) {
        console.error('Failed to load tasks for calendar:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month & number of days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Map tasks by day
  const tasksByDay = {};
  tasks.forEach((task) => {
    const d = new Date(task.deadline);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(task);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Task Deadlines Calendar</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual schedule of task deliverables and due dates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 shadow-xs"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-36 text-center text-sm font-bold text-slate-900">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 shadow-xs"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 pb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-b border-slate-100">
            {/* Blank offset days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-28 bg-slate-50/50 p-2" />
            ))}

            {/* Days of month */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNumber = i + 1;
              const dayTasks = tasksByDay[dayNumber] || [];
              const isToday =
                new Date().getDate() === dayNumber &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${dayNumber}`}
                  className={`min-h-28 p-2 transition hover:bg-slate-50/70 ${
                    isToday ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNumber}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 space-y-1">
                    {dayTasks.slice(0, 3).map((t) => (
                      <Link
                        key={t._id}
                        to={isEmployer ? `/employer/tasks/${t._id}` : `/employee/tasks/${t._id}`}
                        className="block truncate rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-800 hover:bg-emerald-100 hover:text-emerald-800 transition"
                        title={t.title}
                      >
                        <span
                          className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                            t.priority === 'URGENT'
                              ? 'bg-red-500'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        {t.title}
                      </Link>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] font-semibold text-slate-400 block px-1">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
