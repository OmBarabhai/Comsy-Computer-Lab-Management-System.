import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Middleware to authenticate users
export const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Access denied" });
        
        // Verify token (example using jwt)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '9011');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
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