const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'forge_fitness_secret_2024';

// In-memory store for mock mode (when MongoDB not connected)
let mockUsers = [];

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// ─── REGISTER ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, stats, coachProfile } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    // Try MongoDB
    try {
      const User = require('../models/User');
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ error: 'Email already registered.' });
      const assignedRole = role || 'user';
      const approvalStatus = assignedRole === 'admin' ? 'approved' : 'pending';
      const user = new User({ name, email: email.toLowerCase(), password, role: assignedRole, stats: stats || {}, coachProfile: coachProfile || {}, approvalStatus });
      await user.save();
      if (approvalStatus === 'pending') {
        return res.status(201).json({ pending: true, message: 'Registration submitted! Your account is pending admin approval.' });
      }
      return res.status(201).json({ token: generateToken(user), user: user.toJSON() });
    } catch (dbErr) { /* fall through to mock */ }

    // Mock mode
    const existing = mockUsers.find(u => u.email === email.toLowerCase());
    if (existing) return res.status(400).json({ error: 'Email already registered.' });
    const assignedRole = role || 'user';
    const approvalStatus = assignedRole === 'admin' ? 'approved' : 'pending';
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now().toString();
    const user = { id, _id: id, name, email: email.toLowerCase(), password: hashedPassword, role: assignedRole, approvalStatus, stats: stats || {}, coachProfile: coachProfile || {}, streak: { current: 0, longest: 0 }, progressPhotos: [], aiHistory: [], reminders: [], createdAt: new Date() };
    mockUsers.push(user);
    if (approvalStatus === 'pending') {
      return res.status(201).json({ pending: true, message: 'Registration submitted! Your account is pending admin approval.' });
    }
    const { password: _p, ...userOut } = user;
    return res.status(201).json({ token: generateToken(user), user: userOut });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// ─── LOGIN ─────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    // Try MongoDB
    try {
      const User = require('../models/User');
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });
      if (user.role !== 'admin') {
        if (user.approvalStatus === 'pending') return res.status(403).json({ error: 'Your account is pending admin approval. Please wait for confirmation.' });
        if (user.approvalStatus === 'rejected') return res.status(403).json({ error: 'Your registration was not approved. Please contact support.' });
      }
      return res.json({ token: generateToken(user), user: user.toJSON() });
    } catch (dbErr) { /* fall through to mock */ }

    // Mock mode
    const user = mockUsers.find(u => u.email === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });
    if (user.role !== 'admin') {
      if (user.approvalStatus === 'pending') return res.status(403).json({ error: 'Your account is pending admin approval. Please wait for confirmation.' });
      if (user.approvalStatus === 'rejected') return res.status(403).json({ error: 'Your registration was not approved. Please contact support.' });
    }
    const { password: _p, ...userOut } = user;
    return res.json({ token: generateToken(user), user: userOut });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// ─── GET ME ────────────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.id).select('-password');
      if (user) return res.json({ user });
    } catch {}
    const user = mockUsers.find(u => u.id === req.user.id || u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { password: _p, ...userOut } = user;
    return res.json({ user: userOut });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ─── UPDATE PROFILE ────────────────────────────────────────────────────────
router.put('/update-profile', auth, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; delete updates.email;
    try {
      const User = require('../models/User');
      const user = await User.findByIdAndUpdate(req.user.id, { $set: updates, updatedAt: new Date() }, { new: true }).select('-password');
      if (user) return res.json({ user });
    } catch {}
    const idx = mockUsers.findIndex(u => u.id === req.user.id || u._id === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'User not found.' });
    mockUsers[idx] = { ...mockUsers[idx], ...updates };
    const { password: _p, ...userOut } = mockUsers[idx];
    return res.json({ user: userOut });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
module.exports.getMockUsers = () => mockUsers;

// Seed mock admin account on startup
(async () => {
  try {
    if (!mockUsers.find(u => u.email === 'admin@forge.fit')) {
      const hash = await bcrypt.hash('Admin@123', 10);
      mockUsers.push({ id:'admin_001', _id:'admin_001', name:'Forge Admin', email:'admin@forge.fit', password:hash, role:'admin', approvalStatus:'approved', stats:{}, streak:{current:0,longest:0}, progressPhotos:[], reminders:[], createdAt:new Date() });
      console.log('✅ Mock admin ready: admin@forge.fit / Admin@123');
    }
  } catch {}
})();
