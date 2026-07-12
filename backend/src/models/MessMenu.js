const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema(
  {
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true, unique: true },
    weeklyMenu: {
      monday: { breakfast: String, lunch: String, dinner: String },
      tuesday: { breakfast: String, lunch: String, dinner: String },
      wednesday: { breakfast: String, lunch: String, dinner: String },
      thursday: { breakfast: String, lunch: String, dinner: String },
      friday: { breakfast: String, lunch: String, dinner: String },
      saturday: { breakfast: String, lunch: String, dinner: String },
      sunday: { breakfast: String, lunch: String, dinner: String },
    },
    todaysSpecial: { type: String },
    mealPlanPrice: { type: Number, default: 0 },
    isVegOnly: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('MessMenu', messMenuSchema);
