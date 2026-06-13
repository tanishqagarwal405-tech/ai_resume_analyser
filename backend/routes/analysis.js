const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../utils/aiService');
const { generateReport } = require('../utils/reportGenerator');

// ✅ LinkedIn route SABSE PEHLE
router.post('/linkedin', protect, async (req, res) => {
  try {
    const { linkedinUrl, linkedinText } = req.body;
    if (!linkedinText || linkedinText.trim().length < 50) {
      return res.status(400).json({ error: 'Please paste your LinkedIn profile content' });
    }
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `You are an expert LinkedIn profile optimizer and career coach. Analyze the following LinkedIn profile content thoroughly.

LINKEDIN PROFILE CONTENT:
${linkedinText}

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "overallScore": <0-100>,
  "profileStrength": "<Beginner|Intermediate|Advanced|All-Star>",
  "sectionScores": {
    "headline": <0-100>,
    "summary": <0-100>,
    "experience": <0-100>,
    "skills": <0-100>,
    "education": <0-100>,
    "recommendations": <0-100>
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "keywordsFound": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "skillsFound": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "headlineAnalysis": "<analysis of headline>",
  "summaryAnalysis": "<analysis of summary/about section>",
  "profileTips": ["tip1", "tip2", "tip3"]
}`;
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert LinkedIn profile optimizer. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2048,
    });
    const text = completion.choices[0].message.content;
    const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const analysis = JSON.parse(cleaned);
    res.json({ analysis, linkedinUrl: linkedinUrl || null });
  } catch (err) {
    console.error('LinkedIn analysis error:', err.message);
    res.status(500).json({ error: err.message || 'LinkedIn analysis failed' });
  }
});

// Analyze resume
router.post('/:resumeId', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    if (!resume.extractedText || resume.extractedText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract readable text from this resume.' });
    }
    resume.status = 'analyzing';
    if (req.body.jobDescription) resume.jobDescription = req.body.jobDescription;
    await resume.save();
    const analysis = await analyzeResume(resume.extractedText, resume.jobDescription || null);
    resume.analysis = analysis;
    resume.status = 'analyzed';
    await resume.save();
    res.json({ message: 'Analysis complete', analysis, resumeId: resume._id });
  } catch (err) {
    await Resume.findByIdAndUpdate(req.params.resumeId, { status: 'error' });
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// Job match
router.post('/:resumeId/job-match', protect, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide a valid job description' });
    }
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    resume.jobDescription = jobDescription;
    resume.status = 'analyzing';
    await resume.save();
    const analysis = await analyzeResume(resume.extractedText, jobDescription);
    resume.analysis = analysis;
    resume.status = 'analyzed';
    await resume.save();
    res.json({ message: 'Job match analysis complete', analysis });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Job match analysis failed' });
  }
});

// Download report
router.get('/:resumeId/report', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    if (resume.status !== 'analyzed' || !resume.analysis) {
      return res.status(400).json({ error: 'No analysis available. Please analyze first.' });
    }
    const { filePath, fileName } = await generateReport(resume, req.user);
    resume.reportPath = filePath;
    await resume.save();
    res.download(filePath, `Resume_Analysis_Report_${Date.now()}.pdf`);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Report generation failed' });
  }
});

module.exports = router;