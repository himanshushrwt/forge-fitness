const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  protein: Number, // grams
  carbs: Number,
  fat: Number,
  fiber: Number,
  quantity: Number,
  unit: { type: String, default: 'g' }
});

const MealSchema = new mongoose.Schema({
  type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'] },
  time: String,
  foods: [FoodItemSchema],
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number,
  notes: String
});

const NutritionLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  meals: [MealSchema],
  waterIntake: { type: Number, default: 0 }, // ml
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number,
  calorieGoal: Number,
  proteinGoal: Number,
  notes: String,
  // Week plan slot
  weekDay: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
  isTemplate: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('NutritionLog', NutritionLogSchema);
