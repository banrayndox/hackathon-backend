import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';
import * as judgeController from '../controllers/judgeController.js';

const router = express.Router();

router.use(authenticate);
router.use(roleCheck('judge'));

router.get('/my-teams', judgeController.getMyTeams);
router.put('/teams/:teamId/scores', judgeController.updateTeamScores);

export default router;