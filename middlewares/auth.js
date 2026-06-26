import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔑 Auth header:', authHeader); // 👈 লগ দেখ
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    console.log('🔑 Extracted token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Decoded:', decoded);
    const user = await User.findById(decoded.id).select('-__v');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};