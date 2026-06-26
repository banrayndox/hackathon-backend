import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getAllTeams, getTeamById, getAllJudges } from '../controllers/generalController.js';

const router = express.Router();

// General routes require authentication, but are accessible to any registered role
router.use(authenticate);

router.get('/teams', getAllTeams);
router.get('/teams/:teamId', getTeamById);
router.get('/judges', getAllJudges);

export default router;
