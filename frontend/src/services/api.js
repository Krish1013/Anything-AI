const API_BASE = 'https://anything-ai-backend-9292.onrender.com/api/v1';

// ─── Helpers ───────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const message =
      data.errors
        ? data.errors.map((e) => e.message).join(', ')
        : data.message || 'Something went wrong';
    throw new Error(message);
  }
  return data;
};

// ─── Auth API ──────────────────────────────────────────────────────────────

export const registerUser = async (payload) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const loginUser = async (payload) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const getProfile = async () => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// ─── Tasks API ─────────────────────────────────────────────────────────────

export const getTasks = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/tasks${query ? `?${query}` : ''}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getTaskById = async (id) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const createTask = async (payload) => {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const updateTask = async (id, payload) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const deleteTask = async (id) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};
