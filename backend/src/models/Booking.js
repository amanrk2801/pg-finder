const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    monthlyRent: { type: Number, required: true },
    nextDueDate: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Booking', bookingSchema);

