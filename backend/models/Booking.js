const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientName: String,
  clientEmail: String,
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coachMockId: String, // for mock mode
  coachName: String,
  date: { type: String, required: true },       // e.g. '2024-06-15'
  timeSlot: { type: String, required: true },   // e.g. '10:00 AM'
  duration: { type: Number, default: 60 },      // minutes
  sessionType: { type: String, enum: ['online', 'in-person'], default: 'online' },
  goal: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  notes: { type: String, default: '' },
  cancelReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
