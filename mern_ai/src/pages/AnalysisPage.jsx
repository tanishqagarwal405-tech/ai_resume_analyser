import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

const ScoreRing = ({ score, label }) => {
  const size = 120, stroke = 10;
  const radius = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={scoreColor(score)} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: scoreColor(score), fontWeight: '700', fontSize: '24px' }}>{score}</span>
          <span style={{ color: '#475569', fontSize: '11px' }}>/100</span>
        </div>
      </div>
      <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>{label}</span>
    </div>
  );
};

const SkillTag = ({ label, variant }) => {
  const colors = {
    found: { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' },
    missing: { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
    matched: { background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' },
    keyword: { background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' },
  };
  return (
    <span style={{ ...colors[variant], padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '500' }}>
      {label}
    </span>
  );
};

const AnalysisPage = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobDesc, setJobDesc] = useState('');
  const [showJdForm, setShowJdForm] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchResume(); }, [id]);

  const fetchResume = async () => {
    try {
      const res = await api.get(`/resume/${id}`);
      setResume(res.data.resume);
      if (res.data.resume.jobDescription) setJobDesc(res.data.resume.jobDescription);
    } catch {
      toast.error('Could not load resume');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      await api.post(`/analysis/${id}`, { jobDescription: jobDesc || undefined });
      await fetchResume();
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const runJobMatch = async () => {
    if (!jobDesc.trim()) return toast.error('Please enter a job description');
    setAnalyzing(true);
    try {
      await api.post(`/analysis/${id}/job-match`, { jobDescription: jobDesc });
      await fetchResume();
      setShowJdForm(false);
      toast.success('Job match updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Job match failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/analysis/${id}/report`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `Resume_Analysis_${Date.now()}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!resume) return (
    <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
      Resume not found. <Link to="/dashboard" style={{ color: '#818cf8' }}>← Back</Link>
    </div>
  );

  const a = resume.analysis;
  const radarData = a?.sectionScores ? Object.entries(a.sectionScores).map(([k, v]) => ({
    subject: k.charAt(0).toUpperCase() + k.slice(1), score: v
  })) : [];

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'skills', label: '🛠 Skills' },
    { id: 'suggestions', label: '💡 Suggestions' },
    { id: 'jobmatch', label: '🎯 Job Match' },
  ];

  const cardStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', marginBottom: '16px' };
  const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px', color: '#f1f5f9', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ color: '#475569', fontSize: '13px', marginBottom: '4px' }}>
            <Link to="/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>← Dashboard</Link>
            {' / '}
            <span style={{ color: '#94a3b8' }}>{resume.originalName}</span>
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700' }}>Resume Analysis</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {a && (
            <button onClick={downloadReport} disabled={downloading}
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '10px 20px', borderRadius: '10px', cursor: downloading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}>
              {downloading ? 'Downloading...' : '⬇ Download Report'}
            </button>
          )}
          {!a && (
            <button onClick={runAnalysis} disabled={analyzing}
              style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: analyzing ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}>
              {analyzing ? 'Analyzing...' : '🚀 Analyze Now'}
            </button>
          )}
        </div>
      </div>

      {/* Analyzing state */}
      {(resume.status === 'analyzing' || analyzing) && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '20px', height: '20px', border: '2px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          <div>
            <p style={{ color: '#fbbf24', fontWeight: '500' }}>AI is analyzing your resume</p>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>This typically takes 15-30 seconds...</p>
          </div>
        </div>
      )}

      {/* Not analyzed yet */}
      {resume.status === 'uploaded' && !analyzing && !a && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Ready to analyze</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Click the button to run AI analysis</p>
          <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
            placeholder="Optionally paste a job description..."
            rows={4} style={{ ...inputStyle, maxWidth: '500px', marginBottom: '16px' }} />
          <br />
          <button onClick={runAnalysis} disabled={analyzing}
            style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}>
            🚀 Run AI Analysis
          </button>
        </div>
      )}

      {/* Results */}
      {a && (
        <>
          {/* Score Rings */}
          <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center' }}>
            <ScoreRing score={a.atsScore} label="ATS Score" />
            <ScoreRing score={a.overallScore} label="Overall Score" />
            {a.jobMatchScore !== null && a.jobMatchScore !== undefined && (
              <ScoreRing score={a.jobMatchScore} label="Job Match" />
            )}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={cardStyle}>
                  <h3 style={{ color: '#34d399', fontWeight: '600', marginBottom: '12px' }}>✅ Strengths</h3>
                  {a.strengths?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>
                      <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div style={cardStyle}>
                  <h3 style={{ color: '#f87171', fontWeight: '600', marginBottom: '12px' }}>⚠️ Weaknesses</h3>
                  {a.weaknesses?.map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#ef4444', flexShrink: 0 }}>✗</span>
                      <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>

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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                    {Object.entries(a.sectionScores).map(([k, v]) => (
                      <div key={k} style={{ textAlign: 'center' }}>
                        <div style={{ color: scoreColor(v), fontWeight: '700', fontSize: '18px' }}>{v}</div>
                        <div style={{ color: '#475569', fontSize: '11px', textTransform: 'capitalize' }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div>
              {[
                { title: '✅ Skills Found', items: a.skillsFound, variant: 'found' },
                { title: '❌ Missing Skills', items: a.missingSkills, variant: 'missing' },
                { title: '🔑 Keywords Found', items: a.keywordsFound, variant: 'keyword' },
                { title: '🔍 Missing Keywords', items: a.missingKeywords, variant: 'missing' },
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
              {a.suggestions?.map((s, i) => (
                <div key={i} style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', padding: '12px 16px', marginBottom: '10px', display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#6366f1', fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Job Match Tab */}
          {activeTab === 'jobmatch' && (
            <div>
              {a.jobMatchScore !== null && a.jobMatchDetails ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div style={cardStyle}>
                      <h3 style={{ color: '#60a5fa', fontWeight: '600', marginBottom: '12px' }}>✅ Matched Skills</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {a.jobMatchDetails.matchedSkills?.map(s => <SkillTag key={s} label={s} variant="matched" />) || <span style={{ color: '#475569' }}>None</span>}
                      </div>
                    </div>
                    <div style={cardStyle}>
                      <h3 style={{ color: '#f87171', fontWeight: '600', marginBottom: '12px' }}>❌ Missing Skills</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {a.jobMatchDetails.missingSkills?.map(s => <SkillTag key={s} label={s} variant="missing" />) || <span style={{ color: '#475569' }}>None</span>}
                      </div>
                    </div>
                  </div>
                  <div style={cardStyle}>
                    <h3 style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '16px' }}>📝 Recommendations</h3>
                    {a.jobMatchDetails.recommendations?.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ color: '#6366f1', fontWeight: '700' }}>{i + 1}.</span>
                        <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{r}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowJdForm(!showJdForm)}
                    style={{ background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
                    🔄 Update Job Description
                  </button>
                </>
              ) : (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
                  <h3 style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '8px' }}>No Job Description Added</h3>
                  <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>Add a JD to get match score and targeted advice</p>
                  <button onClick={() => setShowJdForm(true)}
                    style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                    + Add Job Description
                  </button>
                </div>
              )}

              {showJdForm && (
                <div style={{ ...cardStyle, marginTop: '16px' }}>
                  <h3 style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '12px' }}>Job Description</h3>
                  <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={8} style={{ ...inputStyle, marginBottom: '16px' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={runJobMatch} disabled={analyzing}
                      style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: analyzing ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                      {analyzing ? 'Analyzing...' : '🚀 Analyze Match'}
                    </button>
                    <button onClick={() => setShowJdForm(false)}
                      style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalysisPage;