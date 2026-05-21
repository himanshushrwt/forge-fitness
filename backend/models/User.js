const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'coach', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  
  // Physical stats
  stats: {
    age: Number,
    height: Number, // cm
    weight: Number, // kg
    gender: { type: String, enum: ['male', 'female', 'other'] },
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    goal: { type: String, enum: ['lose_weight', 'gain_muscle', 'maintain', 'endurance', 'flexibility'] }
  },

  // For coaches
  coachProfile: {
    specializations: [String],
    experience: Number, // years
    certifications: [String],
    hourlyRate: Number,
    availability: [String], // days available
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }
  },

  // Hired trainers (for users)
  hiredTrainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Clients (for coaches)
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Reminders
  reminders: [{
    type: { type: String, enum: ['workout', 'meal', 'water', 'sleep', 'custom'] },
    time: String,
    days: [String],
    message: String,
    isActive: { type: Boolean, default: true }
  }],

  // Progress photos
  progressPhotos: [{
    url: String,
    date: { type: Date, default: Date.now },
    weight: Number,
    notes: String,
    aiAnalysis: String
  }],

  // AI conversation history
  aiHistory: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // Streaks
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: Date
  },

  isActive: { type: Boolean, default: true },
  // Approval status: 'pending' for athlete/coach registrations, 'approved' once admin approves, 'rejected'
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvalNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
