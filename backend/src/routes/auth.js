const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL || process.env.EXPO_PUBLIC_SUPER_ADMIN_EMAIL || null;
const SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD || process.env.EXPO_PUBLIC_SUPER_ADMIN_PASSWORD || null;

function signToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    type: user.type,
  };
  const secret = process.env.JWT_SECRET || 'change-me-in-production';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// Login with strict checks (no auto-register here)
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, type } = req.body;
    if (!email || !password || !type) {
      return res.status(400).json({ message: 'Email, password, and type are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Super admin: env-based, not DB-based
    if (
      type === 'superadmin' &&
      SUPER_ADMIN_EMAIL &&
      SUPER_ADMIN_PASSWORD &&
      normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase() &&
      password === SUPER_ADMIN_PASSWORD
    ) {
      const superAdminUser = {
        id: 'superadmin_1',
        email: normalizedEmail,
        name: 'Super Admin',
        phone: '',
        type: 'superadmin',
      };
      const token = signToken(superAdminUser);
      return res.json({
        token,
        user: superAdminUser,
      });
    }

    // Normal users/admins must exist in DB
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email' });
    }

    if (user.type !== type) {
      return res.status(403).json({ message: 'Role mismatch for this email' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        type: user.type,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// Explicit registration endpoint
router.post('/register', async (req, res, next) => {
  try {
    const {
      email, password, type = 'user', name, phone,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!['user', 'admin'].includes(type)) {
      return res.status(400).json({ message: 'Invalid registration type' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      type,
      name,
      phone,
      status: 'active',
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        type: user.type,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

