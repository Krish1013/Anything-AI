import React from 'react';

const STATUS_COLORS = {
  pending: '#f59e0b',
  'in-progress': '#3b82f6',
  completed: '#10b981',
};

const STATUS_ICONS = {
  pending: '⏳',
  'in-progress': '🔄',
  completed: '✅',
};

const TaskCard = ({ task, userRole, onEdit, onDelete }) => {
  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="task-card" id={`task-${task._id}`}>
      <div className="task-header">
        <span
          className="status-badge"
          style={{ backgroundColor: STATUS_COLORS[task.status] + '22', color: STATUS_COLORS[task.status] }}
        >
          {STATUS_ICONS[task.status]} {task.status}
        </span>
        <span className="task-date">{formattedDate}</span>
      </div>

      <h3 className="task-title">{task.title}</h3>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.user && (
        <div className="task-owner">
          <span className="owner-avatar">
            {task.user.name ? task.user.name[0].toUpperCase() : '?'}
          </span>
          <span className="owner-name">{task.user.name || task.user.email}</span>
        </div>
      )}

      <div className="task-actions">
        <button
          className="btn btn-sm btn-outline"
          onClick={onEdit}
          id={`edit-task-${task._id}`}
        >
          Edit
        </button>
        {userRole === 'admin' && (
          <button
            className="btn btn-sm btn-danger"
            onClick={onDelete}
            id={`delete-task-${task._id}`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
