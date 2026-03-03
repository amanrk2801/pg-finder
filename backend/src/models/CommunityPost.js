const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    contactInfo: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model('CommunityPost', communityPostSchema);

