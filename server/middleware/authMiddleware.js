import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate users
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Middleware to authorize users based on roles or permissions
export const authorize = (roles, permission) => {
  return (req, res, next) => {
    const user = req.user;

    // Check role
    if (roles && !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    // Check permission
    if (permission && (!user.permissions || !user.permissions.includes(permission))) {
      return res.status(403).json({ message: 'Access denied. Missing required permission.' });
    }

    next();
  };
};

// Middleware to check permissions dynamically
export const checkPermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Access denied. Missing required permission.' });
    }
    next();
  };
};

