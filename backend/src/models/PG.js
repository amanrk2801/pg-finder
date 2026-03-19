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
    totalRooms: { type: Number, default: 0 },
    occupiedRooms: { type: Number, default: 0 },
    totalBeds: { type: Number, default: 0 },
    vacantBeds: { type: Number, default: 0 },
    rent: { type: Number, required: true },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'unisex'], 
      default: 'unisex',
      lowercase: true,
      trim: true
    },
    facilities: [String],
    safetyMeasures: [String], // ADDED THIS FIELD
    images: [String],
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('PG', pgSchema);
