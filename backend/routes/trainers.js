const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');

let mockReviews = [];
let mockBookings = [];

const MOCK_TRAINERS = [
  { id:'t1', name:'Marcus Steel',   email:'marcus@forge.fit',  role:'coach', avatar:'MS', bio:'Former national powerlifting champion with 10+ years coaching elite athletes. Specialising in strength, hypertrophy, and sports performance.', coachProfile:{ specializations:['Strength Training','Powerlifting','Sports Performance'], experience:10, certifications:['NSCA-CSCS','NASM-CPT'], hourlyRate:0, rating:4.9, reviewCount:127, isVerified:true,  availability:['Monday','Tuesday','Wednesday','Friday'],           timeSlots:['06:00 AM','07:00 AM','08:00 AM','05:00 PM','06:00 PM','07:00 PM'] }},
  { id:'t2', name:'Sofia Ramirez',  email:'sofia@forge.fit',   role:'coach', avatar:'SR', bio:'Yoga teacher and functional fitness expert. I help busy professionals build strength, flexibility, and mental resilience through mindful movement.', coachProfile:{ specializations:['Yoga','Functional Fitness','Flexibility','Mindfulness'],           experience:7,  certifications:['RYT-500','FMS Level 2'],            hourlyRate:0, rating:4.8, reviewCount:89,  isVerified:true,  availability:['Monday','Wednesday','Thursday','Saturday'],          timeSlots:['07:00 AM','08:00 AM','09:00 AM','04:00 PM','05:00 PM'] }},
  { id:'t3', name:'Jordan Kestrel', email:'jordan@forge.fit',  role:'coach', avatar:'JK', bio:'Competitive marathon runner and HIIT specialist. Transform your cardiovascular fitness and endurance with science-backed training protocols.',  coachProfile:{ specializations:['Running','HIIT','Endurance','Fat Loss'],                        experience:6,  certifications:['RRCA Coach','CrossFit Level 2'],            hourlyRate:0, rating:4.7, reviewCount:63,  isVerified:true,  availability:['Tuesday','Thursday','Saturday','Sunday'],            timeSlots:['06:00 AM','07:00 AM','08:00 AM','06:00 PM','07:00 PM'] }},
  { id:'t4', name:'Priya Sharma',   email:'priya@forge.fit',   role:'coach', avatar:'PS', bio:'Registered dietitian and strength coach. I bridge the gap between nutrition science and performance training for sustainable body transformation.', coachProfile:{ specializations:['Nutrition','Body Composition',"Women's Fitness",'Contest Prep'],  experience:8,  certifications:['RD','NASM-CPT','PN Level 2'],               hourlyRate:0, rating:4.9, reviewCount:142, isVerified:true,  availability:['Monday','Tuesday','Wednesday','Thursday','Friday'],  timeSlots:['08:00 AM','09:00 AM','10:00 AM','03:00 PM','04:00 PM','05:00 PM'] }},
  { id:'t5', name:'Alex Thunder',   email:'alex@forge.fit',    role:'coach', avatar:'AT', bio:'Boxing and martial arts conditioning coach. Build explosive power, agility, and mental toughness through combat sports-inspired training.',       coachProfile:{ specializations:['Boxing','MMA Conditioning','Agility','Explosiveness'],          experience:5,  certifications:['USA Boxing Coach','NASM-CPT'],              hourlyRate:0, rating:4.6, reviewCount:51,  isVerified:false, availability:['Wednesday','Friday','Saturday','Sunday'],            timeSlots:['07:00 AM','08:00 AM','05:00 PM','06:00 PM','07:00 PM'] }},
];

// ─── STATIC ROUTES FIRST (must come before /:id) ──────────────────────────

// GET my bookings (client view)
router.get('/my/bookings', auth, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ client: req.user.id }).sort({ createdAt: -1 });
    return res.json({ bookings });
  } catch {
    const bookings = mockBookings
      .filter(b => b.clientId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ bookings });
  }
});

// GET my sessions (coach view)
router.get('/my/sessions', auth, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ coach: req.user.id }).sort({ createdAt: -1 });
    return res.json({ bookings });
  } catch {
    const bookings = mockBookings
      .filter(b => b.coachId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ bookings });
  }
});

// PUT cancel a booking
router.put('/booking/:bookingId/cancel', auth, async (req, res) => {
  try {
    const { reason = '' } = req.body;
    try {
      const Booking = require('../models/Booking');
      const booking = await Booking.findByIdAndUpdate(
        req.params.bookingId,
        { status: 'cancelled', cancelReason: reason },
        { new: true }
      );
      if (booking) return res.json({ booking, message: 'Booking cancelled.' });
    } catch {}
    const idx = mockBookings.findIndex(b => b.id === req.params.bookingId);
    if (idx > -1) mockBookings[idx] = { ...mockBookings[idx], status: 'cancelled', cancelReason: reason };
    res.json({ booking: mockBookings[idx] || null, message: 'Booking cancelled.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not cancel: ' + err.message });
  }
});

// ─── DYNAMIC ROUTES (/:id and sub-routes) ─────────────────────────────────

// GET all coaches
router.get('/', async (req, res) => {
  try {
    const User = require('../models/User');
    const trainers = await User.find({ role: 'coach', isActive: true }).select('-password');
    if (trainers.length > 0) return res.json({ trainers });
    throw new Error('use mock');
  } catch {
    res.json({ trainers: MOCK_TRAINERS });
  }
});

// GET single coach
router.get('/:id', async (req, res) => {
  try {
    const User = require('../models/User');
    const trainer = await User.findOne({ _id: req.params.id, role: 'coach' }).select('-password');
    if (trainer) return res.json({ trainer });
    throw new Error('use mock');
  } catch {
    const trainer = MOCK_TRAINERS.find(t => t.id === req.params.id);
    if (!trainer) return res.status(404).json({ error: 'Trainer not found.' });
    res.json({ trainer });
  }
});

// GET reviews for a coach
router.get('/:id/reviews', async (req, res) => {
  try {
    const Review = require('../models/Review');
    const reviews = await Review.find({ coach: req.params.id }).sort({ createdAt: -1 });
    return res.json({ reviews });
  } catch {
    const reviews = mockReviews.filter(r => r.coachId === req.params.id);
    res.json({ reviews });
  }
});

// POST submit a review
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5.' });

    try {
      const Review = require('../models/Review');
      const User = require('../models/User');
      const review = await Review.create({
        coach: req.params.id, reviewer: req.user.id,
        reviewerName: req.user.name, rating, comment
      });
      const all = await Review.find({ coach: req.params.id });
      const avg = parseFloat((all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1));
      await User.findByIdAndUpdate(req.params.id, {
        'coachProfile.rating': avg,
        'coachProfile.reviewCount': all.length
      });
      return res.status(201).json({ review, newRating: avg, reviewCount: all.length });
    } catch {}

    // Mock mode
    const review = { id: Date.now().toString(), coachId: req.params.id, reviewerName: req.user.name, rating, comment, createdAt: new Date() };
    mockReviews.push(review);
    const trainer = MOCK_TRAINERS.find(t => t.id === req.params.id);
    if (trainer) {
      const allR = mockReviews.filter(r => r.coachId === req.params.id);
      trainer.coachProfile.rating = parseFloat((allR.reduce((s, r) => s + r.rating, 0) / allR.length).toFixed(1));
      trainer.coachProfile.reviewCount = allR.length;
    }
    res.status(201).json({
      review,
      newRating: trainer?.coachProfile?.rating,
      reviewCount: trainer?.coachProfile?.reviewCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not submit review: ' + err.message });
  }
});

// GET available slots for a coach on a specific date
router.get('/:id/slots', auth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date query param required.' });

    const trainer = MOCK_TRAINERS.find(t => t.id === req.params.id);
    const allSlots = trainer?.coachProfile?.timeSlots || [
      '06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM',
      '02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'
    ];

    let booked = [];
    try {
      const Booking = require('../models/Booking');
      const bookings = await Booking.find({
        $or: [{ coach: req.params.id }, { coachMockId: req.params.id }],
        date,
        status: { $ne: 'cancelled' }
      });
      booked = bookings.map(b => b.timeSlot);
    } catch {
      booked = mockBookings
        .filter(b => (b.coachId === req.params.id || b.coachMockId === req.params.id) && b.date === date && b.status !== 'cancelled')
        .map(b => b.timeSlot);
    }

    const available = allSlots.filter(s => !booked.includes(s));
    res.json({ slots: allSlots, available, booked });
  } catch (err) {
    res.status(500).json({ error: 'Could not get slots: ' + err.message });
  }
});

// POST book a session
router.post('/:id/book', auth, async (req, res) => {
  try {
    const { date, timeSlot, duration = 60, sessionType = 'online', goal = '' } = req.body;
    if (!date || !timeSlot) return res.status(400).json({ error: 'Date and time slot are required.' });

    const trainer = MOCK_TRAINERS.find(t => t.id === req.params.id);
    const coachName = trainer?.name || 'Coach';

    // Check slot not already taken
    try {
      const Booking = require('../models/Booking');
      const existing = await Booking.findOne({
        $or: [{ coach: req.params.id }, { coachMockId: req.params.id }],
        date, timeSlot,
        status: { $ne: 'cancelled' }
      });
      if (existing) return res.status(400).json({ error: 'This slot is already booked. Please choose another time.' });

      const booking = await Booking.create({
        client: req.user.id,
        clientName: req.user.name,
        clientEmail: req.user.email,
        coachMockId: req.params.id,
        coachName,
        date, timeSlot, duration, sessionType, goal,
        status: 'pending'
      });
      return res.status(201).json({ booking, message: `Session booked with ${coachName}! They will confirm shortly.` });
    } catch {}

    // Mock mode
    const alreadyBooked = mockBookings.find(b =>
      (b.coachId === req.params.id) && b.date === date && b.timeSlot === timeSlot && b.status !== 'cancelled'
    );
    if (alreadyBooked) return res.status(400).json({ error: 'This slot is already booked. Please choose another time.' });

    const booking = {
      id: Date.now().toString(),
      clientId: req.user.id,
      clientName: req.user.name,
      coachId: req.params.id,
      coachName,
      date, timeSlot, duration, sessionType, goal,
      status: 'pending',
      createdAt: new Date()
    };
    mockBookings.push(booking);
    res.status(201).json({ booking, message: `Session booked with ${coachName}! They will confirm shortly.` });
  } catch (err) {
    res.status(500).json({ error: 'Could not book session: ' + err.message });
  }
});

// ADMIN: verify coach
router.put('/:id/verify', auth, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const trainer = await User.findByIdAndUpdate(req.params.id, { 'coachProfile.isVerified': true }, { new: true }).select('-password');
    if (trainer) return res.json({ trainer, message: 'Coach verified.' });
    throw new Error('use mock');
  } catch {
    const trainer = MOCK_TRAINERS.find(t => t.id === req.params.id);
    if (trainer) trainer.coachProfile.isVerified = true;
    res.json({ trainer, message: 'Coach verified.' });
  }
});

// ADMIN: unverify coach
router.put('/:id/unverify', auth, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const trainer = await User.findByIdAndUpdate(req.params.id, { 'coachProfile.isVerified': false }, { new: true }).select('-password');
    if (trainer) return res.json({ trainer, message: 'Coach unverified.' });
    throw new Error('use mock');
  } catch {
    const trainer = MOCK_TRAINERS.find(t => t.id === req.params.id);
    if (trainer) trainer.coachProfile.isVerified = false;
    res.json({ trainer, message: 'Coach unverified.' });
  }
});

// ADMIN: remove coach
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    return res.json({ message: 'Coach removed from platform.' });
  } catch {
    const idx = MOCK_TRAINERS.findIndex(t => t.id === req.params.id);
    if (idx > -1) MOCK_TRAINERS.splice(idx, 1);
    res.json({ message: 'Coach removed from platform.' });
  }
});

module.exports = router;
module.exports.getMockBookings = () => mockBookings;
module.exports.getMockReviews = () => mockReviews;
