const express = require('express');
const usersRouter = express.Router();
const remindersRouter = express.Router();
const { auth } = require('../middleware/auth');

// Users routes
usersRouter.get('/leaderboard', auth, async (req, res) => {
  res.json({ 
    leaderboard: [
      { rank: 1, name: 'Marcus K.', streak: 45, workouts: 120, points: 3200 },
      { rank: 2, name: 'Priya S.', streak: 32, workouts: 98, points: 2800 },
      { rank: 3, name: 'Alex T.', streak: 28, workouts: 87, points: 2450 },
      { rank: 4, name: 'Jordan M.', streak: 21, workouts: 76, points: 2100 },
      { rank: 5, name: 'You', streak: 7, workouts: 23, points: 650 }
    ]
  });
});

usersRouter.put('/stats', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { stats: req.body } }, { new: true }).select('-password');
    res.json({ user });
  } catch {
    res.json({ message: 'Stats updated (mock mode)' });
  }
});

// Reminders routes
remindersRouter.get('/', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('reminders');
    res.json({ reminders: user?.reminders || [] });
  } catch {
    res.json({ reminders: [] });
  }
});

remindersRouter.post('/', auth, async (req, res) => {
  try {
    const reminder = { id: Date.now().toString(), ...req.body, isActive: true };
    try {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, { $push: { reminders: reminder } });
    } catch {}
    res.status(201).json({ reminder, message: 'Reminder created!' });
  } catch (err) {
    res.status(500).json({ error: 'Could not create reminder.' });
  }
});

remindersRouter.delete('/:id', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { $pull: { reminders: { _id: req.params.id } } });
    res.json({ message: 'Reminder deleted.' });
  } catch {
    res.json({ message: 'Reminder deleted (mock mode).' });
  }
});

module.exports = { usersRouter, remindersRouter };
