const mongoose = require('mongoose');

const taskActivitySchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true, // 'CREATED', 'STATUS_CHANGED', 'PROGRESS_UPDATED', 'ASSIGNED', 'SUBMITTED', 'REVIEWED', etc.
    },
    oldValue: {
      type: String,
      default: '',
    },
    newValue: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TaskActivity', taskActivitySchema);
