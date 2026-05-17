const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

let mockNutrition = [];

router.get('/', auth, async (req, res) => {
  try {
    const NutritionLog = require('../models/NutritionLog');
    const logs = await NutritionLog.find({ user: req.user.id }).sort({ date: -1 }).limit(30);
    res.json({ logs });
  } catch {
    const logs = mockNutrition.filter(n => n.userId === req.user.id);
    res.json({ logs });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const NutritionLog = require('../models/NutritionLog');
    const log = new NutritionLog({ ...req.body, user: req.user.id });
    await log.save();
    res.status(201).json({ log });
  } catch {
    const log = { id: Date.now().toString(), ...req.body, userId: req.user.id, createdAt: new Date() };
    mockNutrition.push(log);
    res.status(201).json({ log });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const NutritionLog = require('../models/NutritionLog');
    const log = await NutritionLog.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    res.json({ log });
  } catch {
    const idx = mockNutrition.findIndex(n => n.id === req.params.id);
    if (idx > -1) mockNutrition[idx] = { ...mockNutrition[idx], ...req.body };
    res.json({ log: mockNutrition[idx] });
  }
});

module.exports = router;
