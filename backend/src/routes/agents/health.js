const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const auth = require('../../middleware/auth');
const HealthReport = require('../../models/HealthReport');
const path = require('path');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
    }
  }
});

// AI service URL
const HEALTH_AI_SERVICE = process.env.HEALTH_AI_SERVICE || 'http://localhost:8001';

// Upload and process a health report
router.post('/upload-report', auth, upload.single('file'), async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    // Create form data for OCR API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Create a new report in 'processing' status
    const healthReport = new HealthReport({
      userId: req.user.id,
      filename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'processing'
    });
    
    // Save initial report
    await healthReport.save();

    // Process the document asynchronously
    processDocument(req.file, healthReport._id, req.user.id)
      .catch(error => {
        console.error('Error in background processing:', error);
      });

    // Return immediate response to user
    res.json({
      success: true,
      message: 'Document uploaded and processing started',
      data: {
        reportId: healthReport._id,
        filename: req.file.originalname,
        status: 'processing'
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
});

// Asynchronous document processing function
async function processDocument(file, reportId, userId) {
  try {
    // Create form data for OCR API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype
    });

    // Step 1: Extract text with OCR
    const ocrResponse = await axios.post(
      `${HEALTH_AI_SERVICE}/api/ocr/process`,
      formData,
      {
        headers: { ...formData.getHeaders() },
        timeout: 60000 // 1 minute timeout
      }
    );

    const ocrResult = ocrResponse.data;

    // Step 2: Extract medical entities with NER
    const nerResponse = await axios.post(
      `${HEALTH_AI_SERVICE}/api/ner/extract`,
      { text: ocrResult.text },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    const nerResult = nerResponse.data;
    
    // Step 3: Generate text embeddings
    const embeddingResponse = await axios.post(
      `${HEALTH_AI_SERVICE}/api/embeddings/generate`,
      { 
        text: ocrResult.text,
        split_into_chunks: true
      },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    const embeddingResult = embeddingResponse.data;
    
    // Process embeddings for storage
    const embeddingsForStorage = [];
    if (embeddingResult.embeddings && embeddingResult.chunks) {
      for (let i = 0; i < embeddingResult.embeddings.length; i++) {
        embeddingsForStorage.push({
          vector: embeddingResult.embeddings[i],
          text: embeddingResult.chunks[i],
          chunkIndex: i
        });
      }
    }

    // Update report with all processed data
    await HealthReport.findByIdAndUpdate(reportId, {
      extractedText: ocrResult.text,
      entities: nerResult.entities,
      entityGroups: nerResult.entity_groups,
      embeddings: embeddingsForStorage,
      status: 'completed'
    });

    // Clean up uploaded file
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

  } catch (error) {
    console.error('Document processing error:', error);
    
    // Update report status to failed
    await HealthReport.findByIdAndUpdate(reportId, {
      status: 'failed',
      error: error.message
    });

    // Clean up uploaded file
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
  }
}

// Get all reports for a user
router.get('/reports', auth, async (req, res) => {
  try {
    const reports = await HealthReport.find({ userId: req.user.id })
      .select('filename uploadDate status entities entityGroups')
      .sort({ uploadDate: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
});

// Get a specific report by ID
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
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
});

// Search across reports using semantic search
router.post('/search', auth, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Valid search query is required'
      });
    }
    
    // Get all user reports with completed status
    const reports = await HealthReport.find({ 
      userId: req.user.id,
      status: 'completed'
    });
    
    if (reports.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Extract chunks from all reports for semantic search
    const allChunks = [];
    const chunkToReportMap = [];
    
    reports.forEach(report => {
      if (report.embeddings && report.embeddings.length > 0) {
        report.embeddings.forEach(embedding => {
          allChunks.push(embedding.text);
          chunkToReportMap.push({
            reportId: report._id,
            reportName: report.filename,
            chunkIndex: embedding.chunkIndex
          });
        });
      }
    });
    
    // If no chunks, return empty results
    if (allChunks.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Perform semantic search using the AI service
    const searchResponse = await axios.post(
      `${HEALTH_AI_SERVICE}/api/embeddings/search`,
      {
        query: query,
        documents: allChunks,
        top_k: Math.min(5, allChunks.length)
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    // Map results back to reports
    const searchResults = searchResponse.data.results.map(result => {
      const reportInfo = chunkToReportMap[result.index];
      return {
        ...result,
        reportId: reportInfo.reportId,
        reportName: reportInfo.reportName
      };
    });
    
    res.json({
      success: true,
      data: searchResults
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
});

module.exports = router;