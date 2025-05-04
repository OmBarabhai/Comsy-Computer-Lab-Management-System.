import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
    
  });
// Add this test code temporarily in your server
transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP connection verified:', success);
    }
  });
// User Registration with Email
router.post('/register', async (req, res) => {
    try {
        const { username, name, email, password, role } = req.body;

        // Validate required fields
        if (!username || !name || !email || !password || !role) {
            return res.status(400).json({ 
                message: 'All fields are required' 
            });
        }

        // Check for existing username
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ 
                message: 'Username already exists',
                conflict: 'username'
            });
        }

        // Check for existing email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ 
                message: 'Email already exists',
                conflict: 'email'
            });
        }

        // Create new user
        const newUser = new User({ username, name, email, password, role });
        await newUser.save();

        // Prepare email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your New Account Credentials',
            html: `
                <h2>Welcome to Comsy!</h2>
                <p>Hey ${name}</p>
                <p>Your account has been successfully created.</p>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p style="color: red;">Please change your password after first login.</p>
                <hr>
                <p>Best regards,<br>Comsy Team</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Return response without password
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: 'User registered successfully. Credentials sent to email.',
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed',
            error: error.message 
        });
    }
});

// Login endpoint (unchanged but included for completeness)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      // Find the user by username
      const user = await User.findOne({ username });
      if (!user) {
          console.log('User not found:', username);
          return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          console.log('Invalid password for user:', username);
          return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET || '9011',
          { expiresIn: '12h' }
      );

      res.status(200).json({
          token,
          user: {
              id: user._id,
              username: user.username,
              name: user.name,
              email: user.email,
              role: user.role
          }
      });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});
// Protected route example
router.get('/profile', authenticate, async (req, res) => {
  try {
      // Fetch the user's profile using the userId from the token
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ user });
  } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Add this new route to authRoutes.js
router.get('/verify-token', authenticate, (req, res) => {
    res.status(200).json({ valid: true });
});

export default router;