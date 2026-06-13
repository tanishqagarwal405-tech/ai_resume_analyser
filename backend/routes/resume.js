const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const { extractText } = require('../utils/extractor');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/resumes');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Upload resume
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const fileType = ext === 'pdf' ? 'pdf' : 'docx';
    const extractedText = await extractText(req.file.path, fileType);
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      filePath: req.file.path,
      extractedText,
      status: 'uploaded'
    });
    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        status: resume.status,
        createdAt: resume.createdAt
      }
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// Get all resumes
router.get('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select('-extractedText -filePath')
      .sort({ createdAt: -1 });
    res.json({ resumes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Get single resume
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
      .select('-filePath');
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// Delete resume
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    if (fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
    if (resume.reportPath && fs.existsSync(resume.reportPath)) fs.unlinkSync(resume.reportPath);
    await resume.deleteOne();
    res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;