const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submitterName: String,
  submitterEmail: String,
  against: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  againstMockId: String,
  againstName: String,
  againstType: { type: String, enum: ['coach', 'user', 'platform'] },
  category: { type: String, enum: ['fake_profile', 'misconduct', 'payment', 'no_show', 'harassment', 'other'] },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'under_review', 'resolved', 'dismissed'], default: 'open' },
  adminNotes: { type: String, default: '' },
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
