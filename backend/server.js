const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

let cron; try { cron = require('node-cron'); } catch {}

dotenv.config();
const app = express();

// CORS - allow all origins
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/workouts',  require('./routes/workouts'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/trainers',  require('./routes/trainers'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/progress',  require('./routes/progress'));
app.use('/api/ai',        require('./routes/ai'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/dietplan',  require('./routes/dietplan'));
const { usersRouter, remindersRouter } = require('./routes/users_reminders');
app.use('/api/users',     usersRouter);
app.use('/api/reminders', remindersRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/forge-fitness');
    console.log('✅ MongoDB Connected');
    await seedAdmin();
  } catch (err) {
    console.log('⚠️  MongoDB not available — running in mock data mode');
    console.log('   Admin login: admin@forge.fit / Admin@123');
  }
};

const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    const existing = await User.findOne({ email: 'admin@forge.fit' });
    if (!existing) {
      const admin = new User({ name: 'Forge Admin', email: 'admin@forge.fit', password: 'Admin@123', role: 'admin', stats: { fitnessLevel: 'advanced' } });
      await admin.save();
      console.log('✅ Admin account created: admin@forge.fit / Admin@123');
    }
  } catch (err) {
    console.log('Admin seed skipped:', err.message);
  }
};

connectDB();

if (cron) {
  cron.schedule('0 8 * * *', () => console.log('Daily reminder check running...'));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Forge Fitness API running at http://localhost:${PORT}`);
  console.log(`👑 Admin: admin@forge.fit / Admin@123`);
});

module.exports = app;
