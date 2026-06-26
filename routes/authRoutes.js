import express from 'express';
import { googleCallback, getMe, updateProfile, logout, googleLogin } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

export default router;