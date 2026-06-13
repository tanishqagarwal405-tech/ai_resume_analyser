import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../utils/api';
import toast from 'react-hot-toast';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) return toast.error('Only PDF and DOCX files are supported');
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a resume file');

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const uploadRes = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 40) + 10)
      });

      const resumeId = uploadRes.data.resume.id;
      setProgress(50);
      setUploading(false);
      setAnalyzing(true);

      toast.loading('AI is analyzing your resume...', { id: 'analysis' });
      await api.post(`/analysis/${resumeId}`, {
        jobDescription: jobDescription || undefined
      });
      setProgress(100);

      toast.success('Analysis complete!', { id: 'analysis' });
      navigate(`/analysis/${resumeId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed. Please try again.', { id: 'analysis' });
      setProgress(0);
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const isProcessing = uploading || analyzing;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700' }}>Upload Resume</h1>
        <p style={{ color: '#94a3b8', marginTop: '4px' }}>Get ATS score and improvement suggestions in seconds</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Dropzone */}
        <div {...getRootProps()} style={{
          background: isDragActive ? 'rgba(99,102,241,0.1)' : file ? 'rgba(16,185,129,0.05)' : '#1e293b',
          border: `2px dashed ${isDragActive ? '#6366f1' : file ? '#10b981' : '#334155'}`,
          borderRadius: '16px', padding: '48px', textAlign: 'center',
          cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s'
        }}>
          <input {...getInputProps()} />
          {file ? (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {file.name.endsWith('.pdf') ? '📕' : '📘'}
              </div>
              <p style={{ color: '#f1f5f9', fontWeight: '600' }}>{file.name}</p>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
                × Remove
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {isDragActive ? '🎯' : '📤'}
              </div>
              <p style={{ color: '#cbd5e1', fontWeight: '600', fontSize: '16px' }}>
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>or click to browse files</p>
              <p style={{ color: '#334155', fontSize: '12px', marginTop: '8px' }}>PDF or DOCX • Max 5MB</p>
            </div>
          )}
        </div>

        {/* Job Description */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '15px' }}>
              🎯 Job Description <span style={{ color: '#475569', fontWeight: '400', fontSize: '13px' }}>(Optional)</span>
            </h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>
              Add a JD to get job match score and targeted suggestions
            </p>
          </div>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={5}
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px', color: '#f1f5f9', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Progress */}
        {isProcessing && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
                {uploading ? 'Uploading resume...' : 'AI analyzing your resume (20-30 seconds)...'}
              </p>
            </div>
            <div style={{ background: '#0f172a', borderRadius: '999px', height: '6px' }}>
              <div style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', height: '6px', borderRadius: '999px', width: `${progress}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}

        <button type="submit" disabled={!file || isProcessing}
          style={{ width: '100%', background: !file || isProcessing ? '#312e81' : '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: '600', cursor: !file || isProcessing ? 'not-allowed' : 'pointer' }}>
          {isProcessing ? 'Processing...' : '🚀 Analyze with AI'}
        </button>
      </form>

      {/* Features */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px', justifyContent: 'center' }}>
        {['ATS Score', 'Skills Gap', 'Improvement Tips', 'Job Match', 'PDF Report'].map(f => (
          <span key={f} style={{ background: '#1e293b', border: '1px solid #334155', color: '#64748b', padding: '6px 12px', borderRadius: '999px', fontSize: '12px' }}>
            ✓ {f}
          </span>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default UploadPage;