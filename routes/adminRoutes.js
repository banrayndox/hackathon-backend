import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(roleCheck('admin'));

// Users
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// Teams
router.get('/teams', adminController.getAllTeams);
router.delete('/teams/:teamId', adminController.deleteTeam);
router.put('/teams/:teamId/assign-judge', adminController.assignJudge);
router.put('/teams/:teamId/payment', adminController.updateTeamPayment);

// Admin can update any team's scores
router.put('/teams/:teamId/scores', adminController.updateTeamScores);

export default router;