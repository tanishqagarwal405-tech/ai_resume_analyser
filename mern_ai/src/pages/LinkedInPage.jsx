import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

const ScoreRing = ({ score, label, size = 120 }) => {
  const stroke = 10;
  const radius = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={scoreColor(score)}
            strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: scoreColor(score), fontWeight: '700', fontSize: '24px' }}>{score}</span>
          <span style={{ color: '#475569', fontSize: '11px' }}>/100</span>
        </div>
      </div>
      <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500', textAlign: 'center' }}>{label}</span>
    </div>
  );
};

const SkillTag = ({ label, variant }) => {
  const colors = {
    found: { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' },
    missing: { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
    keyword: { background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' },
  };
  return (
    <span style={{ ...colors[variant], padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '500' }}>
      {label}
    </span>
  );
};

const LinkedInPage = () => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinText, setLinkedinText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const cardStyle = {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px'
  };

  const handleAnalyze = async () => {
    if (!linkedinText.trim() || linkedinText.trim().length < 50) {
      return toast.error('Please paste your LinkedIn profile content');
    }
    setAnalyzing(true);
    try {
      const res = await api.post('/analysis/linkedin', { linkedinUrl, linkedinText });
      setAnalysis(res.data.analysis);
      toast.success('LinkedIn profile analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const strengthColor = (strength) => {
    const colors = {
      'Beginner': '#ef4444',
      'Intermediate': '#f59e0b',
      'Advanced': '#6366f1',
      'All-Star': '#10b981'
    };
    return colors[strength] || '#6366f1';
  };

  const radarData = analysis?.sectionScores
    ? Object.entries(analysis.sectionScores).map(([k, v]) => ({
        subject: k.charAt(0).toUpperCase() + k.slice(1),
        score: v
      }))
    : [];

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'skills', label: '🛠 Skills' },
    { id: 'suggestions', label: '💡 Suggestions' },
    { id: 'tips', label: '🔥 Pro Tips' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ color: '#475569', fontSize: '13px', marginBottom: '4px' }}>
          <Link to="/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>← Dashboard</Link>
          {' / '}
          <span style={{ color: '#94a3b8' }}>LinkedIn Analyzer</span>
        </div>
        <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700' }}>
          LinkedIn Profile Analyzer
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '4px' }}>
          Paste your LinkedIn profile content and get AI-powered optimization suggestions
        </p>
      </div>

      {/* Input Section */}
      <div style={cardStyle}>
        <h3 style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '16px' }}>
          🔗 LinkedIn Profile Details
        </h3>

        {/* URL Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>
            LinkedIn Profile URL <span style={{ color: '#475569' }}>(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="https://www.linkedin.com/in/yourname"
            value={linkedinUrl}
            onChange={e => setLinkedinUrl(e.target.value)}
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px 16px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Profile Text */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>
            Profile Content * <span style={{ color: '#475569' }}>(Copy & paste from LinkedIn)</span>
          </label>
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '10px', fontSize: '13px', color: '#94a3b8' }}>
            💡 <strong style={{ color: '#a5b4fc' }}>How to copy LinkedIn content:</strong> Open your LinkedIn profile → Select All (Ctrl+A) → Copy (Ctrl+C) → Paste below
          </div>
          <textarea
            placeholder="Paste your complete LinkedIn profile content here (headline, about, experience, skills, education etc.)..."
            value={linkedinText}
            onChange={e => setLinkedinText(e.target.value)}
            rows={10}
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px 16px', color: '#f1f5f9', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>
            {linkedinText.length} characters {linkedinText.length < 50 ? '(minimum 50 required)' : '✓'}
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || linkedinText.trim().length < 50}
          style={{ background: analyzing || linkedinText.trim().length < 50 ? '#312e81' : '#4f46e5', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '12px', cursor: analyzing || linkedinText.trim().length < 50 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {analyzing ? (
            <>
              <span style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
              Analyzing Profile...
            </>
          ) : '🔍 Analyze LinkedIn Profile'}
        </button>
      </div>

      {/* Results */}
      {analysis && (
        <>
          {/* Score + Strength */}
          <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', justifyContent: 'center' }}>
            <ScoreRing score={analysis.overallScore} label="Profile Score" />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: strengthColor(analysis.profileStrength) }}>
                {analysis.profileStrength}
              </div>
              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Profile Strength</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {Object.entries(analysis.sectionScores || {}).map(([k, v]) => (
                <div key={k} style={{ textAlign: 'center', background: '#0f172a', borderRadius: '10px', padding: '10px 16px' }}>
                  <div style={{ color: scoreColor(v), fontWeight: '700', fontSize: '18px' }}>{v}</div>
                  <div style={{ color: '#475569', fontSize: '11px', textTransform: 'capitalize' }}>{k}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '4px', marginBottom: '16px', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ flex: 1, minWidth: 'fit-content', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', background: activeTab === tab.id ? '#4f46e5' : 'transparent', color: activeTab === tab.id ? 'white' : '#64748b', whiteSpace: 'nowrap' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Headline & Summary Analysis */}
              {analysis.headlineAnalysis && (
                <div style={cardStyle}>
                  <h3 style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '12px' }}>📌 Headline Analysis</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7' }}>{analysis.headlineAnalysis}</p>
                </div>
              )}
              {analysis.summaryAnalysis && (
                <div style={cardStyle}>
                  <h3 style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '12px' }}>📝 Summary Analysis</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7' }}>{analysis.summaryAnalysis}</p>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={cardStyle}>
                  <h3 style={{ color: '#34d399', fontWeight: '600', marginBottom: '12px' }}>✅ Strengths</h3>
                  {analysis.strengths?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>
                      <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div style={cardStyle}>
                  <h3 style={{ color: '#f87171', fontWeight: '600', marginBottom: '12px' }}>⚠️ Weaknesses</h3>
                  {analysis.weaknesses?.map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#ef4444', flexShrink: 0 }}>✗</span>
                      <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar Chart */}
              {radarData.length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '16px' }}>📡 Section Breakdown</h3>
                  <div style={{ height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} formatter={(v) => [`${v}/100`]} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div>
              {[
                { title: '✅ Skills Found', items: analysis.skillsFound, variant: 'found' },
                { title: '❌ Missing Skills', items: analysis.missingSkills, variant: 'missing' },
                { title: '🔑 Keywords Found', items: analysis.keywordsFound, variant: 'keyword' },
                { title: '🔍 Missing Keywords', items: analysis.missingKeywords, variant: 'missing' },
              ].map(section => (
                <div key={section.title} style={cardStyle}>
                  <h3 style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '12px' }}>{section.title}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {section.items?.length > 0
                      ? section.items.map(s => <SkillTag key={s} label={s} variant={section.variant} />)
                      : <span style={{ color: '#475569', fontSize: '14px' }}>None detected</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div style={cardStyle}>
              <h3 style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '16px' }}>💡 Improvement Suggestions</h3>
              {analysis.suggestions?.map((s, i) => (
                <div key={i} style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', padding: '12px 16px', marginBottom: '10px', display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#6366f1', fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pro Tips Tab */}
          {activeTab === 'tips' && (
            <div style={cardStyle}>
              <h3 style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '16px' }}>🔥 Pro Tips to Boost Your Profile</h3>
              {analysis.profileTips?.map((tip, i) => (
                <div key={i} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '10px', display: 'flex', gap: '10px' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>🔥</span>
                  <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LinkedInPage;