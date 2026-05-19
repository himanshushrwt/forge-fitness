const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const nodemailer = require('nodemailer');

let mockPlans = [];
let mockReminders = [];

// GET diet plan for user
router.get('/', auth, async (req, res) => {
  try {
    const plans = mockPlans.filter(p => p.userId === req.user.id);
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch diet plan.' });
  }
});

// POST save diet plan
router.post('/', auth, async (req, res) => {
  try {
    const { meals, name = 'My Diet Plan' } = req.body;
    const plan = {
      id: Date.now().toString(),
      userId: req.user.id,
      name, meals,
      createdAt: new Date()
    };
    // Remove existing plan for user
    mockPlans = mockPlans.filter(p => p.userId !== req.user.id);
    mockPlans.push(plan);
    res.status(201).json({ plan, message: 'Diet plan saved!' });
  } catch (err) {
    res.status(500).json({ error: 'Could not save diet plan.' });
  }
});

// POST send email reminder for diet/meal
router.post('/remind', auth, async (req, res) => {
  try {
    const { email, mealName, time, items } = req.body;
    if (!email || !mealName) return res.status(400).json({ error: 'Email and meal name required.' });

    // Try to send email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `🍽️ Forge Fitness Meal Reminder: ${mealName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#f9fafb;padding:2rem;border-radius:12px;">
            <h2 style="color:#2563eb;margin-bottom:0.5rem;">Forge Fitness</h2>
            <h3 style="color:#111827;">Time for: ${mealName}</h3>
            <p style="color:#6b7280;">Scheduled at: <strong>${time}</strong></p>
            ${items && items.length > 0 ? `
              <div style="background:white;border-radius:8px;padding:1rem;margin-top:1rem;">
                <h4 style="color:#374151;margin-bottom:0.5rem;">Items:</h4>
                <ul style="color:#4b5563;margin:0;padding-left:1.5rem;">
                  ${items.map(i => `<li>${i.name}${i.quantity ? ` — ${i.quantity} ${i.unit || ''}` : ''}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            <p style="color:#9ca3af;font-size:0.8rem;margin-top:1.5rem;">Forge Fitness — Stay consistent, stay strong!</p>
          </div>
        `
      });
      return res.json({ message: `Reminder email sent to ${email}!` });
    } catch (emailErr) {
      console.log('Email not configured:', emailErr.message);
    }

    // Store reminder for display even if email fails
    const reminder = { id: Date.now().toString(), userId: req.user.id, email, mealName, time, items, createdAt: new Date() };
    mockReminders.push(reminder);
    res.json({ message: 'Reminder saved! (Email requires EMAIL_USER and EMAIL_PASS in backend .env)', reminder });
  } catch (err) {
    res.status(500).json({ error: 'Could not set reminder.' });
  }
});

module.exports = router;
