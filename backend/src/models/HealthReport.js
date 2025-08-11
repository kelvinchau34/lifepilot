const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema({
  text: String,
  label: String,
  confidence: Number,
  start: Number,
  end: Number
});

const embeddingSchema = new mongoose.Schema({
  vector: [Number],
  text: String,
  chunkIndex: Number
});

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
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  entities: [entitySchema],
  entityGroups: {
    type: Map,
    of: [entitySchema]
  },
  embeddings: [embeddingSchema],
  summary: {
    type: String,
    default: ''
  },
  reportDate: {
    type: Date
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  }
}, {
  timestamps: true
});

// Add text index for basic search
healthReportSchema.index({ extractedText: 'text' });

module.exports = mongoose.model('HealthReport', healthReportSchema);