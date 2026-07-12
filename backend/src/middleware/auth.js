const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const auth = (roles = [], isOptional = false) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    if (isOptional) return next();
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
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
