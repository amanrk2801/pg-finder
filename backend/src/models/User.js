const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    type: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      required: true,
    },
    name: { type: String },
    phone: { type: String },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);

