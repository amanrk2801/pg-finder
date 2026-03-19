const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL || process.env.EXPO_PUBLIC_SUPER_ADMIN_EMAIL || 'admin@pgfinder.com';
const SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD || process.env.EXPO_PUBLIC_SUPER_ADMIN_PASSWORD || 'admin123';

function signToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    type: user.type,
  };
  const secret = process.env.JWT_SECRET || 'change-me-in-production';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
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

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email' });
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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post('/register', async (req, res, next) => {
  try {
    const {
      email, password, type = 'user', name, phone,
    } = req.body;

    console.log(`[AUTH] Registration attempt: ${email} as ${type}`);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    const assignedType = type === 'admin' ? 'pending_admin' : 'user';
    const normalizedEmail = email.trim().toLowerCase();
    
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      type: assignedType,
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

/**
 * @swagger
 * /auth/status/{id}:
 *   put:
 *     summary: Toggle user status (Superadmin only)
 *     tags: [Auth]
 */
router.put('/status/:id', auth(['superadmin']), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/approve-admin/{id}:
 *   put:
 *     summary: Approve pending admin (Superadmin only)
 *     tags: [Auth]
 */
router.put('/approve-admin/:id', auth(['superadmin']), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.type !== 'pending_admin') return res.status(400).json({ message: 'User is not a pending admin' });
    user.type = 'admin';
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/pending-admins:
 *   get:
 *     summary: List all pending admin requests (Superadmin only)
 *     tags: [Auth]
 */
router.get('/pending-admins', auth(['superadmin']), async (req, res, next) => {
  try {
    const users = await User.find({ type: 'pending_admin' }).select('-passwordHash').lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: List all users (Superadmin only)
 *     tags: [Auth]
 */
router.get('/users', auth(['superadmin']), async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
