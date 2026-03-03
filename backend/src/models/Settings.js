const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    platformFee: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Settings', settingsSchema);

