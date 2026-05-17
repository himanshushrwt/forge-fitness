const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

let mockWorkouts = [];

// GET all workouts for user
router.get('/', auth, async (req, res) => {
  try {
    const Workout = require('../models/Workout');
    const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
    res.json({ workouts });
  } catch {
    const workouts = mockWorkouts.filter(w => w.userId === req.user.id);
    res.json({ workouts });
  }
});

// GET weekly plan
router.get('/weekly-plan', auth, async (req, res) => {
  try {
    const Workout = require('../models/Workout');
    const workouts = await Workout.find({ user: req.user.id, isTemplate: true });
    res.json({ weeklyPlan: workouts });
  } catch {
    const workouts = mockWorkouts.filter(w => w.userId === req.user.id && w.isTemplate);
    res.json({ weeklyPlan: workouts });
  }
});

// POST create workout
router.post('/', auth, async (req, res) => {
  try {
    const Workout = require('../models/Workout');
    const workout = new Workout({ ...req.body, user: req.user.id });
    await workout.save();
    res.status(201).json({ workout });
  } catch {
    const workout = { id: Date.now().toString(), ...req.body, userId: req.user.id, createdAt: new Date() };
    mockWorkouts.push(workout);
    res.status(201).json({ workout });
  }
});

// PUT update workout
router.put('/:id', auth, async (req, res) => {
  try {
    const Workout = require('../models/Workout');
    const workout = await Workout.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    res.json({ workout });
  } catch {
    const idx = mockWorkouts.findIndex(w => w.id === req.params.id && w.userId === req.user.id);
    if (idx > -1) mockWorkouts[idx] = { ...mockWorkouts[idx], ...req.body };
    res.json({ workout: mockWorkouts[idx] });
  }
});

// DELETE workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const Workout = require('../models/Workout');
    await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Workout deleted.' });
  } catch {
    mockWorkouts = mockWorkouts.filter(w => !(w.id === req.params.id && w.userId === req.user.id));
    res.json({ message: 'Workout deleted.' });
  }
});

module.exports = router;
