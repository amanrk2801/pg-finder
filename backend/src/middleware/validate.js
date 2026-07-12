// Minimal declarative body validator — no external deps.
// Usage: router.post('/', validateBody({ rent: { type: 'number', required: true, min: 1 } }), handler)
//
// Rule options: type ('string'|'number'|'boolean'|'array'), required, min, max
// (numeric bounds or string/array length), enum, trim.

function validateBody(rules) {
  return (req, res, next) => {
    const body = req.body || {};
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      let value = body[field];

      if (value === undefined || value === null || value === '') {
        if (rule.required) errors.push(`${field} is required`);
        continue;
      }

      if (rule.type === 'number') {
        value = Number(value);
        if (Number.isNaN(value)) {
          errors.push(`${field} must be a number`);
          continue;
        }
        body[field] = value;
        if (rule.min !== undefined && value < rule.min) errors.push(`${field} must be at least ${rule.min}`);
        if (rule.max !== undefined && value > rule.max) errors.push(`${field} must be at most ${rule.max}`);
      } else if (rule.type === 'string') {
        if (typeof value !== 'string') {
          errors.push(`${field} must be a string`);
          continue;
        }
        if (rule.trim) body[field] = value.trim();
        const len = body[field].length;
        if (rule.min !== undefined && len < rule.min) errors.push(`${field} must be at least ${rule.min} characters`);
        if (rule.max !== undefined && len > rule.max) errors.push(`${field} must be at most ${rule.max} characters`);
      } else if (rule.type === 'boolean') {
        if (typeof value !== 'boolean') errors.push(`${field} must be true or false`);
      } else if (rule.type === 'array') {
        if (!Array.isArray(value)) {
          errors.push(`${field} must be an array`);
          continue;
        }
        if (rule.max !== undefined && value.length > rule.max) errors.push(`${field} must have at most ${rule.max} items`);
      }

      if (rule.enum && !rule.enum.includes(body[field])) {
        errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
      }
    }

    if (errors.length) {
      return res.status(400).json({ message: errors.join('; ') });
    }
    return next();
  };
}

module.exports = validateBody;
