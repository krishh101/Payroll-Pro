import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', icon: '⊞', label: 'Dashboard' },
  { path: '/employees', icon: '👥', label: 'Employees' },
  { path: '/departments', icon: '🏢', label: 'Departments' },
  { path: '/payroll', icon: '💰', label: 'Payroll' },
  { path: '/leaves', icon: '📅', label: 'Leaves' },
  { path: '/reports', icon: '📊', label: 'Reports' },
];

export default function Sidebar() {
  const { user, logout, isHR } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const roleColor = {
    admin: '#3b82f6',
    hr: '#10b981',
    employee: '#f59e0b',
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Payroll<span>Pro</span></h1>
        <p>v1.0.0 — DBMS Project</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => {
          if (!isHR() && (item.path === '/departments')) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div
            className="user-avatar"
            style={{ background: roleColor[user?.role] || '#3b82f6' }}
          >
            {getInitials(user?.name)}
          </div>
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
