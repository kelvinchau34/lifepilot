const express = require('express');
const multer = require('multer');
const auth = require('../../middleware/auth');
const HealthReport = require('../../models/HealthReport');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'storage/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|tiff/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  }
});

// @route   GET /api/agents/health/status
// @desc    Get health agent status with AI capabilities
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const userReports = await HealthReport.countDocuments({ userId: req.user.id });
    
    res.json({
      success: true,
      data: {
        agent: 'health',
        status: 'active',
        capabilities: [
          'Document Upload & OCR',
          'Medical Entity Recognition',
          'Health Report Analysis',
          'Symptom Assessment',
          'Q&A over Medical Data'
        ],
        userReports: userReports,
        aiModels: {
          ocr: 'PyMuPDF + Tesseract',
          ner: 'Medical NER (HuggingFace)',
          llm: 'Claude/GPT-4',
          embeddings: 'SentenceTransformers'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health agent status'
    });
  }
});

// @route   POST /api/agents/health/upload-report
// @desc    Upload and process health report (PDF/image)
// @access  Private
router.post('/upload-report', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // For now, return basic info about the uploaded file
    res.json({
      success: true,
      data: {
        filename: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        mimetype: req.file.mimetype,
        status: 'uploaded',
        message: 'File uploaded successfully'
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading report'
    });
  }
});

// @route   GET /api/agents/health/reports
// @desc    Get user's health reports
// @access  Private
router.get('/reports', auth, async (req, res) => {
  try {
    const reports = await HealthReport.find({ userId: req.user.id })
      .select('filename uploadDate status summary entities')
      .sort({ uploadDate: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
});

// @route   GET /api/agents/health/reports/:id
// @desc    Get specific health report details
// @access  Private
router.get('/reports/:id', auth, async (req, res) => {
  try {
    const report = await HealthReport.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report'
    });
  }
});

// @route   POST /api/agents/health/ask-question
// @desc    Ask questions about health reports using AI
// @access  Private
router.post('/ask-question', auth, async (req, res) => {
  try {
    const { question, reportId } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    // TODO: Implement vector search + LLM pipeline
    // 1. Embed the question
    // 2. Search vector store for relevant chunks
    // 3. Call LLM with context + question
    // 4. Return answer with citations

    res.json({
      success: true,
      data: {
        question,
        answer: 'AI processing not yet implemented. This will use vector search + LLM to answer questions about your health reports.',
        sources: [],
        confidence: 0.0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing question'
    });
  }
});

module.exports = router;