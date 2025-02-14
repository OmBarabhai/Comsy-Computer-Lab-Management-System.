import { body, validationResult } from 'express-validator';

// Validation rules for user registration
export const validateUserRegistration = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['admin', 'student', 'staff']).withMessage('Invalid role'),
];

// Validation rules for booking creation
export const validateBookingCreation = [
  body('computer_id').notEmpty().withMessage('Computer ID is required'),
  body('startTime').isISO8601().withMessage('Invalid start time'),
  body('endTime').isISO8601().withMessage('Invalid end time'),
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};