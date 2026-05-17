const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'forge_fitness_secret_2024';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const coachOnly = (req, res, next) => {
  if (req.user.role !== 'coach' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Coaches only.' });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { auth, coachOnly, adminOnly };
