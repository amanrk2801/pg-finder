const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    type: {
      type: String,
      enum: ['user', 'admin', 'pending_admin', 'superadmin'],
      required: true,
    },
    name: { type: String },
    phone: { type: String },
    // Owner verification (admin accounts only)
    panOrAadhaar: { type: String },
    ownershipProofRef: { type: String },
    businessRegNumber: { type: String }, // optional — most small PG owners have none
    verificationDocs: [String], // uploaded document photo URLs
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

