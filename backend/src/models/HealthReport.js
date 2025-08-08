const mongoose = require('mongoose');

const healthReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading'
  },
  extractedText: {
    type: String,
    default: ''
  },
  entities: [{
    text: String,
    label: String,
    confidence: Number,
    start: Number,
    end: Number
  }],
  summary: {
    type: String,
    default: ''
  },
  insights: [{
    type: String,
    category: String,
    confidence: Number
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HealthReport', healthReportSchema);