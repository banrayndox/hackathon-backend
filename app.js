import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import judgeRoutes from './routes/judgeRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import generalRoutes from './routes/generalRoutes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // আপনার ফ্রন্টএন্ড URL
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/participant', participantRoutes);
app.use('/api', generalRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});