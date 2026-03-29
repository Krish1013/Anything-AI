import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const Dashboard = ({ onNavigate }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({});

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchTasks = async (status = filterStatus) => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      const res = await getTasks(params);
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      if (err.message.includes('Token expired') || err.message.includes('Invalid token')) {
        handleLogout();
      } else {
        showAlert('error', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      onNavigate('login');
      return;
    }
    fetchTasks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('login');
  };

  const handleCreate = async (formData) => {
    try {
      const res = await createTask(formData);
      showAlert('success', res.message);
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      const res = await updateTask(id, formData);
      showAlert('success', res.message);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await deleteTask(id);
      showAlert('success', res.message);
      fetchTasks();
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    fetchTasks(status);
  };

  const stats = {
    total: pagination.total || 0,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">✓</span>
          <span className="brand-name">TaskManager</span>
        </div>
        <div className="navbar-right">
          <div className="user-badge">
            <span className="user-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</span>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
            </div>
          </div>
          <button className="btn btn-outline" onClick={handleLogout} id="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Alert */}
        {message && (
          <div className={`alert alert-${message.type} alert-floating`}>
            {message.text}
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card stat-progress">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card stat-completed">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-bar">
          <div className="filter-group">
            <span className="filter-label">Filter:</span>
            {['', 'pending', 'in-progress', 'completed'].map((s) => (
              <button
                key={s || 'all'}
                className={`filter-btn ${filterStatus === s ? 'active' : ''}`}
                onClick={() => handleFilterChange(s)}
                id={`filter-${s || 'all'}`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            id="create-task-btn"
          >
            + New Task
          </button>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="loading-state">
            <div className="loader" />
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks found</h3>
            <p>Create your first task to get started.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                userRole={user.role}
                onEdit={() => setEditingTask(task)}
                onDelete={() => handleDelete(task._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showModal || editingTask) && (
        <TaskModal
          task={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSubmit={editingTask
            ? (data) => handleUpdate(editingTask._id, data)
            : handleCreate
          }
        />
      )}
    </div>
  );
};

export default Dashboard;
