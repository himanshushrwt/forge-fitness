const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

let mockBookings = [];

// GET athlete's own bookings
router.get('/my', auth, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ client: req.user.id }).sort({ date: 1 });
    return res.json({ bookings });
  } catch {
    const bookings = mockBookings.filter(b => b.clientId === req.user.id).sort((a,b) => new Date(a.date) - new Date(b.date));
    res.json({ bookings });
  }
});

// GET coach's own sessions
router.get('/coach', auth, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ coachMockId: req.user.id }).sort({ date: 1 });
    return res.json({ bookings });
  } catch {
    const bookings = mockBookings.filter(b => b.coachId === req.user.id).sort((a,b) => new Date(a.date) - new Date(b.date));
    res.json({ bookings });
  }
});

// PUT cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason = '' } = req.body;
    try {
      const Booking = require('../models/Booking');
      const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled', cancelReason: reason }, { new: true });
      if (booking) return res.json({ booking, message: 'Booking cancelled.' });
    } catch {}
    const idx = mockBookings.findIndex(b => b.id === req.params.id);
    if (idx > -1) mockBookings[idx] = { ...mockBookings[idx], status: 'cancelled', cancelReason: reason };
    res.json({ booking: mockBookings[idx], message: 'Booking cancelled.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not cancel.' });
  }
});

module.exports = router;
module.exports.getMockBookings = () => mockBookings;
module.exports.addBooking = (b) => mockBookings.push(b);
