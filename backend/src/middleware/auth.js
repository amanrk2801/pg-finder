const jwt = require('jsonwebtoken');

function auth(requiredRoles = []) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;

      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me-in-production');
      req.user = payload;

      if (requiredRoles.length && !requiredRoles.includes(payload.type)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

module.exports = auth;

