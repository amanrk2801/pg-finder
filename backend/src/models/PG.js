const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    location: {
      lat: Number,
      lng: Number,
    },
    rent: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'unisex'], default: 'unisex' },
    facilities: [String],
    images: [String],
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('PG', pgSchema);

