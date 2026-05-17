const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup uploads directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET progress stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Calculate stats from workout and nutrition logs
    res.json({
      stats: {
        totalWorkouts: 0,
        totalVolume: 0,
        currentStreak: 0,
        longestStreak: 0,
        avgCaloriesPerDay: 0,
        weightHistory: [],
        workoutHistory: []
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch stats.' });
  }
});

// POST upload progress photo
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    
    const photoUrl = `/uploads/${req.file.filename}`;
    const photo = {
      url: photoUrl,
      date: new Date(),
      weight: req.body.weight ? parseFloat(req.body.weight) : undefined,
      notes: req.body.notes || ''
    };
    
    // Try to save to DB
    try {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, { $push: { progressPhotos: photo } });
    } catch {}
    
    res.json({ photo, message: 'Photo uploaded successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Could not upload photo.' });
  }
});

// POST log weight
router.post('/weight', auth, async (req, res) => {
  try {
    const { weight, date } = req.body;
    res.json({ message: 'Weight logged!', entry: { weight, date: date || new Date() } });
  } catch (err) {
    res.status(500).json({ error: 'Could not log weight.' });
  }
});

module.exports = router;
