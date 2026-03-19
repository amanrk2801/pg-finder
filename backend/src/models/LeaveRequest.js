const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    checkOutDate: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
