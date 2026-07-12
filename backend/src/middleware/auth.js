const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const User = require('../models/User');

const auth = (roles = [], isOptional = false) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    if (isOptional) return next();
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // The env-based superadmin has no DB record; everyone else must still be active.
    if (decoded.type !== 'superadmin') {
      const user = await User.findById(decoded.id).select('status type').lean();
      if (!user || user.status === 'suspended') {
        if (isOptional) return next();
        return res.status(401).json({ message: 'Account suspended or no longer exists' });
      }
      // Keep role current — e.g. a pending_admin approved after login gets admin rights,
      // and a demoted account loses them without waiting for token expiry.
      decoded.type = user.type;
    }

    req.user = decoded;

    if (roles.length && !roles.includes(decoded.type)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    return next();
  } catch {
    if (isOptional) return next();
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;
