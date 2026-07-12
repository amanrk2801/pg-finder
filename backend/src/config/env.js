require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pg_finder',
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',
  JWT_EXPIRES_IN: '7d',
  SUPER_ADMIN_EMAIL:
    process.env.SUPER_ADMIN_EMAIL || process.env.EXPO_PUBLIC_SUPER_ADMIN_EMAIL || 'admin@pgfinder.com',
  SUPER_ADMIN_PASSWORD:
    process.env.SUPER_ADMIN_PASSWORD || process.env.EXPO_PUBLIC_SUPER_ADMIN_PASSWORD || 'admin123',
};
