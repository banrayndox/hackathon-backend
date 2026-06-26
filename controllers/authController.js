import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getGoogleTokens, getGoogleUserInfo } from '../config/googleOAuth.js';

// Generate JWT
const generateToken = (user) => {
  console.log(`generateToken`)
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Google OAuth callback (exchange code, get user, create/update user, return token)
export const googleCallback = async (req, res) => {
    console.log(`GoogleCallback`)
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code missing' });
    }

    // Get tokens
    const tokens = await getGoogleTokens(code);
    const { access_token } = tokens;

    // Get user info
    const googleUser = await getGoogleUserInfo(access_token);
    const { id, name, email, picture } = googleUser;

    // Check if user exists
    let user = await User.findOne({ googleId: id });
    if (!user) {
      // Create new user
      user = new User({
        googleId: id,
        name,
        email,
        profilePicture: picture || '',
        role: 'participant', // default
      });
      await user.save();

    } else {
      // Update profile picture and name if changed
      user.name = name;
      user.profilePicture = picture || user.profilePicture;
      await user.save();
    }
     console.log(user)
    // Generate JWT
    const token = generateToken(user);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error.message);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

// Get current user profile
export const getMe = async (req, res) => {
    console.log(`getMe`)
  try {
    const user = await User.findById(req.user._id).select('-__v');
    console.log(user)
     res.json(user);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

// Update profile (allowed for self)
export const updateProfile = async (req, res) => {
    console.log(`updateProfile`)
  try {
    const allowedFields = [
      'department',
      'phone',
      'bio',
      'expertise',
      'industry',
      'designation',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Prevent role update via this endpoint
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-__v');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Logout
export const logout = (req, res) => {
    console.log(`logout`)
  res.json({ message: 'Logged out successfully' });
};