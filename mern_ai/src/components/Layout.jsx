import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      {/* Navbar */}
      <header style={{ background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid #1e293b', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '13px' }}>AI</div>
          <span style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '16px' }}>ResumeAI</span>
        </Link>

        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ padding: '8px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', background: location.pathname === '/dashboard' ? '#4f46e5' : 'transparent', color: location.pathname === '/dashboard' ? 'white' : '#94a3b8' }}>
            Dashboard
          </Link>
          <Link to="/upload" style={{ padding: '8px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', background: location.pathname === '/upload' ? '#4f46e5' : 'transparent', color: location.pathname === '/upload' ? 'white' : '#94a3b8' }}>
            Upload Resume
          </Link>
          <Link to="/linkedin" style={{ padding: '8px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', background: location.pathname === '/linkedin' ? '#4f46e5' : 'transparent', color: location.pathname === '/linkedin' ? 'white' : '#94a3b8' }}>
            LinkedIn
            </Link>
        </nav>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{user?.name}</span>
            <span style={{ color: '#64748b', fontSize: '11px' }}>▾</span>
          </button>

          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', width: '200px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', zIndex: 100 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155' }}>
                <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '500' }}>{user?.name}</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>{user?.email}</p>
              </div>
              <div style={{ padding: '8px' }}>
                <button onClick={handleLogout} style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: '#f87171', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' }}>
                  ⎋ Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '16px', textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: '12px' }}>ResumeAI — Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default Layout;