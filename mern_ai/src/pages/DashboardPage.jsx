import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resume');
      setResumes(res.data.resumes);
    } catch {
      toast.error('Could not load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resume/${id}`);
      setResumes(prev => prev.filter(r => r._id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const analyzed = resumes.filter(r => r.status === 'analyzed');
  const avgScore = analyzed.length
    ? Math.round(analyzed.reduce((sum, r) => sum + (r.analysis?.overallScore || 0), 0) / analyzed.length)
    : null;

  const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

  const statusBadge = (status) => {
    const styles = {
      uploaded: { background: '#1e3a5f', color: '#60a5fa' },
      analyzing: { background: '#451a03', color: '#fbbf24' },
      analyzed: { background: '#064e3b', color: '#34d399' },
      error: { background: '#450a0a', color: '#f87171' }
    };
    return (
      <span style={{ ...styles[status], padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700' }}>Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px' }}>Upload your resume and get an instant AI-powered ATS analysis.</p>
        </div>
        <Link to="/upload" style={{ background: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          + Upload Resume
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Resumes Uploaded', value: resumes.length, icon: '📄', color: '#1e3a5f' },
          { label: 'Analyzed', value: analyzed.length, icon: '✅', color: '#064e3b' },
          { label: 'Avg. Score', value: avgScore ? `${avgScore}%` : '—', icon: '🎯', color: '#312e81' },
          { label: 'Best Score', value: analyzed.length ? `${Math.max(...analyzed.map(r => r.analysis?.overallScore || 0))}%` : '—', icon: '🏆', color: '#451a03' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700' }}>{stat.value}</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Resume List */}
      <h2 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Your Resumes</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>Loading...</div>
      ) : resumes.length === 0 ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '64px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p style={{ color: '#94a3b8', fontWeight: '500' }}>No resumes yet</p>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>Upload your first resume to get started</p>
          <Link to="/upload" style={{ display: 'inline-block', marginTop: '16px', background: '#4f46e5', color: 'white', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' }}>
            Upload Resume
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {resumes.map(r => (
            <div key={r._id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: r.fileType === 'pdf' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {r.fileType === 'pdf' ? '📕' : '📘'}
                </div>
                <div>
                  <p style={{ color: '#f1f5f9', fontWeight: '500', fontSize: '14px' }}>{r.originalName}</p>
                  <p style={{ color: '#475569', fontSize: '12px' }}>
                    {(r.fileSize / 1024).toFixed(1)} KB • {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {statusBadge(r.status)}
                {r.analysis?.overallScore && (
                  <span style={{ color: scoreColor(r.analysis.overallScore), fontWeight: '700', fontSize: '14px' }}>
                    {r.analysis.overallScore}%
                  </span>
                )}
                <button onClick={() => navigate(`/analysis/${r._id}`)}
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                  {r.status === 'analyzed' ? 'View' : 'Analyze'}
                </button>
                <button onClick={() => handleDelete(r._id)}
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;