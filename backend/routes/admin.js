const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');

let mockComplaints = [
  { id:'c1', submitterName:'John Doe', submitterEmail:'john@example.com', againstName:'Unknown Coach', againstType:'coach', category:'fake_profile', description:'This coach has no real certifications. Their profile photo is stock imagery.', status:'open', adminNotes:'', createdAt:new Date(Date.now()-86400000*2) },
  { id:'c2', submitterName:'Sarah K.', submitterEmail:'sarah@example.com', againstName:'Platform', againstType:'platform', category:'other', description:'The AI coach gave incorrect advice about my injury. Please review.', status:'open', adminNotes:'', createdAt:new Date(Date.now()-86400000) },
];

// ─── GET dashboard stats ───────────────────────────────────
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    let totalUsers=0, totalCoaches=0, totalBookings=0, pendingComplaints=0, pendingRegistrations=0;
    try {
      const User = require('../models/User');
      const Booking = require('../models/Booking');
      const Complaint = require('../models/Complaint');
      [totalUsers, totalCoaches, totalBookings, pendingComplaints, pendingRegistrations] = await Promise.all([
        User.countDocuments({ role:'user', approvalStatus:'approved' }),
        User.countDocuments({ role:'coach', approvalStatus:'approved' }),
        Booking.countDocuments(),
        Complaint.countDocuments({ status:'open' }),
        User.countDocuments({ approvalStatus:'pending' })
      ]);
    } catch {
      totalUsers=142; totalCoaches=5; totalBookings=38;
      pendingComplaints = mockComplaints.filter(c=>c.status==='open').length;
      // Count mock pending users from auth module
      try { const { getMockUsers } = require('./auth'); pendingRegistrations = getMockUsers().filter(u=>u.approvalStatus==='pending').length; } catch {}
    }
    res.json({ stats:{ totalUsers, totalCoaches, totalBookings, pendingComplaints, pendingRegistrations } });
  } catch (err) {
    res.status(500).json({ error:'Could not fetch stats.' });
  }
});

// ─── GET pending registrations ─────────────────────────────
router.get('/registrations/pending', auth, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const pending = await User.find({ approvalStatus:'pending' }).select('-password').sort({ createdAt:-1 });
    return res.json({ users: pending });
  } catch {
    try {
      const { getMockUsers } = require('./auth');
      const pending = getMockUsers().filter(u => u.approvalStatus === 'pending').map(({ password: _p, ...u }) => u);
      res.json({ users: pending });
    } catch { res.json({ users: [] }); }
  }
});

// ─── PUT approve registration ──────────────────────────────
router.put('/registrations/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const { note = '' } = req.body;
    try {
      const User = require('../models/User');
      const user = await User.findByIdAndUpdate(req.params.id, { approvalStatus:'approved', approvalNote: note }, { new:true }).select('-password');
      if (user) return res.json({ user, message: user.name + "'s registration approved." });
    } catch {}
    // Mock mode
    try {
      const { getMockUsers } = require('./auth');
      const allMock = getMockUsers();
      const idx = allMock.findIndex(u => u.id === req.params.id || u._id === req.params.id);
      if (idx > -1) { allMock[idx].approvalStatus = 'approved'; allMock[idx].approvalNote = note; }
    } catch {}
    res.json({ message: 'Registration approved (mock).' });
  } catch (err) {
    res.status(500).json({ error: 'Could not approve.' });
  }
});

// ─── PUT reject registration ───────────────────────────────
router.put('/registrations/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const { note = '' } = req.body;
    try {
      const User = require('../models/User');
      const user = await User.findByIdAndUpdate(req.params.id, { approvalStatus:'rejected', approvalNote: note }, { new:true }).select('-password');
      if (user) return res.json({ user, message: user.name + "'s registration rejected." });
    } catch {}
    // Mock mode
    try {
      const { getMockUsers } = require('./auth');
      const allMock = getMockUsers();
      const idx = allMock.findIndex(u => u.id === req.params.id || u._id === req.params.id);
      if (idx > -1) { allMock[idx].approvalStatus = 'rejected'; allMock[idx].approvalNote = note; }
    } catch {}
    res.json({ message: 'Registration rejected (mock).' });
  } catch (err) {
    res.status(500).json({ error: 'Could not reject.' });
  }
});

// ─── GET all coaches ───────────────────────────────────────
router.get('/coaches', auth, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const coaches = await User.find({ role:'coach' }).select('-password').sort({ createdAt:-1 });
    if (coaches.length > 0) return res.json({ coaches });
    throw new Error('use mock');
  } catch {
    res.json({ coaches: [] });
  }
});

// ─── GET all users ─────────────────────────────────────────
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({}).select('-password').sort({ createdAt:-1 }).limit(100);
    return res.json({ users });
  } catch {
    res.json({ users: [] });
  }
});

// ─── PUT verify/unverify coach ─────────────────────────────
router.put('/coaches/:id/verify', auth, adminOnly, async (req, res) => {
  try {
    const { verified } = req.body;
    try {
      const User = require('../models/User');
      const coach = await User.findByIdAndUpdate(req.params.id, { 'coachProfile.isVerified': verified }, { new:true }).select('-password');
      if (coach) return res.json({ coach, message: verified ? 'Coach verified.' : 'Coach unverified.' });
    } catch {}
    res.json({ message: verified ? 'Coach verified (mock).' : 'Coach unverified (mock).' });
  } catch (err) {
    res.status(500).json({ error:'Could not update.' });
  }
});

// ─── DELETE / suspend user ─────────────────────────────────
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message:'User suspended from platform.' });
  } catch {
    res.json({ message:'User suspended (mock mode).' });
  }
});

// ─── GET all bookings ──────────────────────────────────────
router.get('/bookings', auth, adminOnly, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({}).sort({ createdAt:-1 }).limit(50);
    return res.json({ bookings });
  } catch {
    res.json({ bookings: [] });
  }
});

// ─── GET all complaints ────────────────────────────────────
router.get('/complaints', auth, adminOnly, async (req, res) => {
  try {
    const Complaint = require('../models/Complaint');
    const complaints = await Complaint.find({}).sort({ createdAt:-1 });
    return res.json({ complaints });
  } catch {
    res.json({ complaints: mockComplaints });
  }
});

// ─── POST submit complaint (any logged-in user) ────────────
router.post('/complaints', auth, async (req, res) => {
  try {
    const { againstName, againstType, category, description } = req.body;
    if (!description) return res.status(400).json({ error:'Description required.' });
    try {
      const Complaint = require('../models/Complaint');
      const complaint = await Complaint.create({ submittedBy:req.user.id, submitterName:req.user.name, submitterEmail:req.user.email, againstName, againstType, category, description });
      return res.status(201).json({ complaint, message:'Complaint submitted. Admin will review within 24 hours.' });
    } catch {}
    const complaint = { id:Date.now().toString(), submitterName:req.user.name, submitterEmail:req.user.email, againstName, againstType, category, description, status:'open', adminNotes:'', createdAt:new Date() };
    mockComplaints.push(complaint);
    res.status(201).json({ complaint, message:'Complaint submitted. Admin will review within 24 hours.' });
  } catch (err) {
    res.status(500).json({ error:'Could not submit complaint.' });
  }
});

// ─── PUT update complaint status ───────────────────────────
router.put('/complaints/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    try {
      const Complaint = require('../models/Complaint');
      const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status, adminNotes, resolvedAt: ['resolved','dismissed'].includes(status) ? new Date() : undefined }, { new:true });
      if (complaint) return res.json({ complaint, message:'Complaint updated.' });
    } catch {}
    const idx = mockComplaints.findIndex(c => c.id === req.params.id);
    if (idx > -1) mockComplaints[idx] = { ...mockComplaints[idx], status, adminNotes };
    res.json({ complaint: mockComplaints[idx], message:'Complaint updated.' });
  } catch (err) {
    res.status(500).json({ error:'Could not update.' });
  }
});

// ─── GET all reviews ───────────────────────────────────────
router.get('/reviews', auth, adminOnly, async (req, res) => {
  try {
    const Review = require('../models/Review');
    const reviews = await Review.find({}).sort({ createdAt:-1 }).limit(100);
    return res.json({ reviews });
  } catch {
    res.json({ reviews: [] });
  }
});

// ─── DELETE a review ───────────────────────────────────────
router.delete('/reviews/:id', auth, adminOnly, async (req, res) => {
  try {
    const Review = require('../models/Review');
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message:'Review deleted.' });
  } catch {
    res.json({ message:'Review deleted (mock mode).' });
  }
});

module.exports = router;
