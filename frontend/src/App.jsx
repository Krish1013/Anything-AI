import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  const [page, setPage] = useState('login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setPage('dashboard');
    }
  }, []);

  const navigate = (dest) => setPage(dest);

  if (page === 'register') return <Register onNavigate={navigate} />;
  if (page === 'dashboard') return <Dashboard onNavigate={navigate} />;
  return <Login onNavigate={navigate} />;
}

export default App;
