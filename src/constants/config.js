// Central place for environment-driven configuration.
// EXPO_PUBLIC_* vars are read from .env at bundle time (see .env.example).
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
