const mongoose = require('mongoose');

const ExerciseLogSchema = new mongoose.Schema({
  exerciseId: String,
  name: String,
  category: String,
  sets: [{
    reps: Number,
    weight: Number, // kg
    duration: Number, // seconds
    completed: { type: Boolean, default: false }
  }],
  notes: String
});

const WorkoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  duration: Number, // minutes
  type: { type: String, enum: ['strength', 'cardio', 'flexibility', 'hiit', 'sports', 'custom'] },
  exercises: [ExerciseLogSchema],
  totalVolume: Number, // kg lifted total
  caloriesBurned: Number,
  notes: String,
  mood: { type: String, enum: ['great', 'good', 'ok', 'tired', 'bad'] },
  isCompleted: { type: Boolean, default: false },
  isTemplate: { type: Boolean, default: false },
  // Week plan slot
  weekDay: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }
}, { timestamps: true });

module.exports = mongoose.model('Workout', WorkoutSchema);
