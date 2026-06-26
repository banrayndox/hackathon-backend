import Team from '../models/Team.js';

export const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ assignedJudge: req.user._id })
      .populate('members', 'name email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTeamScores = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { innovation, complexity, design, presentation, functionality, feedback } =
      req.body;

    const team = await Team.findOne({
      _id: teamId,
      assignedJudge: req.user._id,
    });
    if (!team) {
      return res
        .status(403)
        .json({ message: 'You are not assigned to this team' });
    }

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