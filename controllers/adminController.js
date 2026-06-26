import User from '../models/User.js';
import Team from '../models/Team.js';

// ---------- User Management ----------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!['admin', 'judge', 'participant'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- Team Management ----------
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('assignedJudge', 'name email')
      .populate('members', 'name email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findByIdAndDelete(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignJudge = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { judgeId } = req.body;
    const judge = await User.findOne({ _id: judgeId, role: 'judge' });
    if (!judge) {
      return res.status(400).json({ message: 'Invalid judge ID or not a judge' });
    }
    const team = await Team.findByIdAndUpdate(
      teamId,
      { assignedJudge: judgeId },
      { new: true }
    ).populate('assignedJudge', 'name email');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTeamPayment = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { paid, transactionId, paymentMethod } = req.body;
    const team = await Team.findByIdAndUpdate(
      teamId,
      { paid, transactionId, paymentMethod },
      { new: true }
    );
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------- Update Team Scores (Admin) ----------
export const updateTeamScores = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { innovation, complexity, design, presentation, functionality, feedback } =
      req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Update only provided fields
    if (innovation !== undefined) team.criteria.innovation = innovation;
    if (complexity !== undefined) team.criteria.complexity = complexity;
    if (design !== undefined) team.criteria.design = design;
    if (presentation !== undefined) team.criteria.presentation = presentation;
    if (functionality !== undefined) team.criteria.functionality = functionality;
    if (feedback !== undefined) team.feedback = feedback;

    await team.save();
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};