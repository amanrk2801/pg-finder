const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = require('../config/env');

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    type: user.type,
  };
}

async function login(req, res, next) {
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
      return res.json({ token, user: superAdminUser });
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
    return res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function register(req, res, next) {
  try {
    const {
      email, password, type = 'user', name, phone,
      businessRegNumber, ownershipProofRef,
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

    if (type === 'admin' && (!businessRegNumber || !ownershipProofRef)) {
      return res.status(400).json({
        message: 'Business registration number and property ownership proof reference are required to onboard as an owner',
      });
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
      name: name?.trim(),
      phone,
      status: 'active',
      ...(type === 'admin' ? { businessRegNumber, ownershipProofRef } : {}),
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function toggleUserStatus(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

async function approveAdmin(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.type !== 'pending_admin') return res.status(400).json({ message: 'User is not a pending admin' });
    user.type = 'admin';
    await user.save();
    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

async function listPendingAdmins(req, res, next) {
  try {
    const users = await User.find({ type: 'pending_admin' }).select('-passwordHash').lean();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('-passwordHash').lean();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  register,
  toggleUserStatus,
  approveAdmin,
  listPendingAdmins,
  listUsers,
};
