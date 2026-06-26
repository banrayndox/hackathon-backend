import Team from '../models/Team.js';
import User from '../models/User.js';

// Helper: Check if a user is already in any team
const isUserInTeam = async (userId) => {
  const team = await Team.findOne({ members: userId });
  return !!team;
};

// Helper: Get user's current team
const getUserTeam = async (userId) => {
  return await Team.findOne({ members: userId });
};

// ---------- Get my teams (participant's own teams) ----------
export const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user._id })
      .populate('leader', 'name email')
      .populate('assignedJudge', 'name email')
      .populate('members', 'name email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- Create a team (only if not in any team) ----------
export const createTeam = async (req, res) => {
  try {
    const { name, initialMembers = [] } = req.body;

    // Check if user is already in a team
    if (await isUserInTeam(req.user._id)) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    // Check if team name is unique
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already taken' });
    }

    // Generate unique code
    let code;
    let codeExists = true;
    while (codeExists) {
      code = 'TEAM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await Team.findOne({ code });
      if (!existing) codeExists = false;
    }

    // Prepare members: leader + optional initial members
    const memberIds = [req.user._id];
    for (const memberId of initialMembers) {
      // Ensure member exists and is not already in a team
      const user = await User.findById(memberId);
      if (!user) {
        return res.status(400).json({ message: `User ${memberId} not found` });
      }
      if (await isUserInTeam(memberId)) {
        return res.status(400).json({ message: `User ${user.email} is already in a team` });
      }
      memberIds.push(memberId);
    }

    const team = new Team({
      name,
      code,
      leader: req.user._id,
      members: memberIds,
    });

    await team.save();

    // Populate and return
    const populatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------- Join a team by invite code ----------
export const joinTeamByCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Invitation code is required' });
    }

    // Check if user is already in a team
    if (await isUserInTeam(req.user._id)) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    const team = await Team.findOne({ code });
    if (!team) {
      return res.status(404).json({ message: 'Team not found with this invitation code' });
    }

    // Add user to members
    team.members.push(req.user._id);
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.json(populatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------- Join a team (by team ID) ----------
export const joinTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Check if user is already in a team
    if (await isUserInTeam(req.user._id)) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Add user to members
    team.members.push(req.user._id);
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.json(populatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------- Add member to team (only leader) ----------
export const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { memberId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only leader can add members
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team leader can add members' });
    }

    // Check if member exists and not already in a team
    const user = await User.findById(memberId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (await isUserInTeam(memberId)) {
      return res.status(400).json({ message: 'User is already in a team' });
    }

    // Add member
    team.members.push(memberId);
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.json(populatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------- Remove member from team (only leader) ----------
export const removeTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { memberId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only leader can remove members
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team leader can remove members' });
    }

    // Cannot remove the leader (they should leave via leaveTeam or delete)
    if (memberId === team.leader.toString()) {
      return res.status(400).json({ message: 'Leader cannot be removed. Use delete team or transfer leadership.' });
    }

    // Check if member is in the team
    if (!team.members.includes(memberId)) {
      return res.status(400).json({ message: 'User is not a member of this team' });
    }

    // Remove member
    team.members = team.members.filter(id => id.toString() !== memberId);
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.json(populatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------- Delete team (only leader) ----------
export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only leader can delete
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team leader can delete the team' });
    }

    await team.deleteOne();
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- Leave team (any member) ----------
export const leaveTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is a member
    if (!team.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are not a member of this team' });
    }

    // If user is leader, transfer leadership or delete if alone
    if (team.leader.toString() === req.user._id.toString()) {
      // Remove leader from members
      team.members = team.members.filter(id => id.toString() !== req.user._id.toString());
      if (team.members.length === 0) {
        // No members left, delete the team
        await team.deleteOne();
        return res.json({ message: 'Team deleted as you were the only member' });
      } else {
        // Transfer leadership to first remaining member
        team.leader = team.members[0];
        await team.save();
        const populated = await Team.findById(team._id)
          .populate('leader', 'name email')
          .populate('members', 'name email');
        return res.json({ message: 'You left the team. Leadership transferred to another member.', team: populated });
      }
    } else {
      // Non-leader leaves: just remove from members
      team.members = team.members.filter(id => id.toString() !== req.user._id.toString());
      await team.save();
      const populated = await Team.findById(team._id)
        .populate('leader', 'name email')
        .populate('members', 'name email');
      return res.json({ message: 'You left the team successfully', team: populated });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ---------- Team payment (only leader) ----------
export const updateTeamPayment = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { paid, transactionId, paymentMethod } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only leader can update payment
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the team leader can manage payment' });
    }

    if (paid !== undefined) team.paid = paid;
    if (transactionId !== undefined) team.transactionId = transactionId;
    if (paymentMethod !== undefined) team.paymentMethod = paymentMethod;

    await team.save();

    const populated = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};