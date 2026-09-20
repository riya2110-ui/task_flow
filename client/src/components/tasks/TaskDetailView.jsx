import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import TaskModal from './TaskModal';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  FileText,
  Upload,
  Play,
  RotateCcw,
  ThumbsUp,
  XCircle,
  Activity,
  Paperclip
} from 'lucide-react';

const TaskDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Action States
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Submit Work Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);

  // Review Modal (Employer)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Edit Task Modal (Employer)
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Progress Update
  const [progressVal, setProgressVal] = useState(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  const isEmployer = user?.role === 'EMPLOYER';
  const isAssignee = task?.assignedTo?._id === user?.id || task?.assignedTo?._id === user?._id;

  const fetchTaskDetails = async () => {
    try {
      const res = await api.get(`/tasks/${id}`);
      if (res.data.success) {
        setTask(res.data.task);
        setActivities(res.data.activities || []);
        setComments(res.data.comments || []);
        setProgressVal(res.data.task.progress || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  // Handle Quick Status Change (e.g., Start Task)
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/tasks/${id}/status`, { status: newStatus });
      if (res.data.success) {
        fetchTaskDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status transition failed');
    }
  };

  // Handle Progress Save
  const handleProgressSave = async () => {
    setUpdatingProgress(true);
    try {
      await api.patch(`/tasks/${id}/progress`, { progress: progressVal });
      fetchTaskDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Handle Employee Work Submission
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setSubmittingWork(true);
    try {
      const attachments = [];
      if (attachmentUrl.trim()) {
        attachments.push({
          name: attachmentName.trim() || 'Work Document',
          url: attachmentUrl.trim(),
        });
      }

      await api.post(`/tasks/${id}/submit`, {
        submissionNotes,
        attachments,
      });

      setSubmitModalOpen(false);
      setSubmissionNotes('');
      setAttachmentUrl('');
      setAttachmentName('');
      fetchTaskDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit task');
    } finally {
      setSubmittingWork(false);
    }
  };

  // Handle Employer Review
  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/tasks/${id}/review`, {
        action: reviewAction,
        feedback: reviewFeedback,
      });
      setReviewModalOpen(false);
      setReviewFeedback('');
      fetchTaskDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/tasks/${id}/comments`, { message: newComment });
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment('');
        // Refresh activities to show new comment action
        fetchTaskDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <p className="font-semibold">{error || 'Task not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs border border-slate-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(isEmployer ? '/employer/tasks' : '/employee/tasks')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tasks</span>
        </button>

        {isEmployer && (
          <button
            onClick={() => setEditModalOpen(true)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Edit Task
          </button>
        )}
      </div>

      {/* Main Task Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{task.title}</h1>
            <p className="text-xs text-slate-500">
              Created by <span className="font-medium text-slate-700">{task.createdBy?.name}</span> on{' '}
              {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons based on Role & Status */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Employee Action 1: Start Task */}
            {(!isEmployer || isAssignee) && task.status === 'TODO' && (
              <button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Task</span>
              </button>
            )}

            {/* Employee Action 2: Resume after changes requested */}
            {(!isEmployer || isAssignee) && task.status === 'CHANGES_REQUESTED' && (
              <button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Resume Work</span>
              </button>
            )}

            {/* Employee Action 3: Submit Work */}
            {(!isEmployer || isAssignee) && task.status === 'IN_PROGRESS' && (
              <button
                onClick={() => setSubmitModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Submit Work</span>
              </button>
            )}

            {/* Employer Action: Review Submission */}
            {isEmployer && ['SUBMITTED', 'UNDER_REVIEW'].includes(task.status) && (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Review Submission</span>
              </button>
            )}

            {task.status === 'COMPLETED' && (
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>Task Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Task Metadata Strip */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4 text-xs">
          <div>
            <span className="block text-slate-400 font-medium">Assignee</span>
            <div className="mt-1 flex items-center gap-2">
              <img
                src={task.assignedTo?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignedTo?.name}`}
                alt={task.assignedTo?.name}
                className="h-6 w-6 rounded-full border border-slate-200"
              />
              <span className="font-semibold text-slate-800 truncate">{task.assignedTo?.name}</span>
            </div>
          </div>

          <div>
            <span className="block text-slate-400 font-medium">Deadline</span>
            <div className="mt-1 flex items-center gap-1.5 text-slate-800 font-semibold">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          <div>
            <span className="block text-slate-400 font-medium">Estimated Time</span>
            <div className="mt-1 flex items-center gap-1.5 text-slate-800 font-semibold">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{task.estimatedHours || 0} hours</span>
            </div>
          </div>

          <div>
            <span className="block text-slate-400 font-medium">Completion Date</span>
            <span className="mt-1 block font-semibold text-slate-800">
              {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</h3>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        {/* Progress Controls */}
        <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Task Progress</span>
            <span className="text-xs font-bold text-emerald-600">{progressVal}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressVal}%` }}
            />
          </div>

          {/* Slider for Assignee or Employer if not completed */}
          {task.status !== 'COMPLETED' && (isAssignee || isEmployer) && (
            <div className="flex items-center gap-3 pt-2">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progressVal}
                onChange={(e) => setProgressVal(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <button
                onClick={handleProgressSave}
                disabled={updatingProgress || progressVal === task.progress}
                className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-40"
              >
                {updatingProgress ? 'Saving...' : 'Save Progress'}
              </button>
            </div>
          )}
        </div>

        {/* Submission Details if submitted or completed */}
        {(task.submissionNotes || task.attachments?.length > 0) && (
          <div className="mt-6 rounded-xl border border-purple-100 bg-purple-50/50 p-4">
            <h3 className="text-xs font-bold text-purple-900 flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-600" />
              <span>Work Submission Details</span>
            </h3>
            {task.submissionNotes && (
              <p className="mt-2 text-xs text-purple-950 whitespace-pre-line">
                {task.submissionNotes}
              </p>
            )}
            {task.attachments?.length > 0 && (
              <div className="mt-3 space-y-1">
                <span className="text-[11px] font-semibold text-purple-700">Attachments:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {task.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-2.5 py-1 text-xs font-medium text-purple-800 hover:bg-purple-100"
                    >
                      <Paperclip className="h-3 w-3" />
                      <span>{att.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two Columns: Comments & Activity History */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Comments Column */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col h-[520px]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Task Discussion</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {comments.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 py-3 space-y-3">
            {comments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No comments yet. Start the conversation!
              </div>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={c.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.userId?.name}`}
                        alt={c.userId?.name}
                        className="h-6 w-6 rounded-full border border-slate-200"
                      />
                      <span className="text-xs font-bold text-slate-800">{c.userId?.name}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 uppercase">
                        {c.userId?.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-700 pl-8 leading-relaxed">
                    {c.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="border-t border-slate-100 pt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment or question..."
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>

        {/* Activity Timeline Column */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col h-[520px]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Activity Timeline</h2>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-4">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No activity records logged.
              </div>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Activity className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800">
                      <span className="font-semibold text-slate-900">{act.userId?.name}</span>{' '}
                      <span className="text-slate-500 font-medium">
                        {act.action === 'CREATED' && 'created this task'}
                        {act.action === 'STATUS_CHANGED' && `changed status from ${act.oldValue} to ${act.newValue}`}
                        {act.action === 'PROGRESS_UPDATED' && `updated progress to ${act.newValue}`}
                        {act.action === 'SUBMITTED' && 'submitted work for review'}
                        {act.action === 'APPROVED' && 'approved task and marked COMPLETED'}
                        {act.action === 'CHANGES_REQUESTED' && 'requested changes on submission'}
                        {act.action === 'COMMENT_ADDED' && 'commented on task'}
                        {act.action === 'REASSIGNED' && 'reassigned the task'}
                        {act.action === 'PRIORITY_CHANGED' && `changed priority to ${act.newValue}`}
                      </span>
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Submit Work Modal (Employee) */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
            <h2 className="text-base font-bold text-slate-900">Submit Work for Review</h2>
            <p className="mt-1 text-xs text-slate-500">
              Provide summary notes and deliverables for the employer to review.
            </p>

            <form onSubmit={handleSubmitWork} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Submission Notes *</label>
                <textarea
                  required
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Summarize what has been accomplished..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Attachment Name</label>
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="e.g. Pull Request, Figma Link, or Report"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Deliverable URL / Link</label>
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://github.com/... or https://figma.com/..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWork}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submittingWork && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Submit Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (Employer) */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
            <h2 className="text-base font-bold text-slate-900">Review Task Submission</h2>
            <p className="mt-1 text-xs text-slate-500">
              Approve to mark as COMPLETED, or request changes with specific feedback.
            </p>

            <form onSubmit={handleReview} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction('APPROVE')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                    reviewAction === 'APPROVE'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Approve & Complete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction('REQUEST_CHANGES')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                    reviewAction === 'REQUEST_CHANGES'
                      ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="h-4 w-4" />
                  <span>Request Changes</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  {reviewAction === 'APPROVE' ? 'Approval Note (Optional)' : 'Required Changes / Feedback *'}
                </label>
                <textarea
                  required={reviewAction === 'REQUEST_CHANGES'}
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder={
                    reviewAction === 'APPROVE'
                      ? 'Good job on completing this on time!'
                      : 'Specify what modifications are required before approval...'
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 ${
                    reviewAction === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submittingReview && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{reviewAction === 'APPROVE' ? 'Confirm Approval' : 'Send Changes Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEmployer && (
        <TaskModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onTaskSaved={fetchTaskDetails}
          initialData={task}
        />
      )}
    </div>
  );
};

export default TaskDetailView;
