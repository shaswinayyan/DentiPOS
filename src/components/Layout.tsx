import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="layout">
      {/* Title Bar for Electron */}
      <div className="title-bar">
        <span>DentiPOS</span>
      </div>

      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface-color)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ marginBottom: '32px', paddingLeft: '12px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🦷</span> DentiPOS
            </h2>
          </div>
          
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Receipt size={20} /> Billing
          </NavLink>
          <NavLink to="/clinical" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Receipt size={20} /> Clinical & Rx
          </NavLink>
          <NavLink to="/records" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Patient Records
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Reports
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Settings size={20} /> Admin / Settings
          </NavLink>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button className="sidebar-link w-full text-left" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-color)', padding: '32px' }}>
        {children}
      </main>

      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--text-muted);
          text-decoration: none;
          border-radius: var(--radius);
          transition: 0.2s;
          font-weight: 500;
        }
        .sidebar-link:hover {
          background: rgba(0, 108, 250, 0.05);
          color: var(--primary-color);
        }
        .sidebar-link.active {
          background: rgba(0, 108, 250, 0.1);
          color: var(--primary-color);
          font-weight: 600;
        }
        .w-full { width: 100%; }
        .text-left { text-align: left; }
      `}</style>
    </div>
  );
}
