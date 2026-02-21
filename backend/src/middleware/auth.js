const userService = require('../services/userService');

function loadUser(req, res, next) {
  const headerValue = req.header('x-user-id');
  if (!headerValue) {
    return res.status(401).json({ error: 'x-user-id header is required' });
  }
  const id = Number(headerValue);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid x-user-id header' });
  }
  const user = userService.getUserById(id);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  req.user = user;
  return next();
}

function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

module.exports = {
  loadUser,
  requireRole,
};

