const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  atsScore: { type: Number, min: 0, max: 100 },
  overallScore: { type: Number, min: 0, max: 100 },
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  skillsFound: [String],
  missingSkills: [String],
  keywordsFound: [String],
  missingKeywords: [String],
  sectionScores: {
    contact: { type: Number, default: 0 },
    summary: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    skills: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 }
  },
  jobMatchScore: { type: Number, min: 0, max: 100 },
  jobMatchDetails: {
    matchedSkills: [String],
    missingSkills: [String],
    recommendations: [String]
  },
  analyzedAt: { type: Date, default: Date.now }
});

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx'], required: true },
  fileSize: { type: Number },
  filePath: { type: String, required: true },
  extractedText: { type: String },
  jobDescription: { type: String, default: null },
  analysis: { type: analysisSchema, default: null },
  status: {
    type: String,
    enum: ['uploaded', 'analyzing', 'analyzed', 'error'],
    default: 'uploaded'
  },
  reportPath: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);