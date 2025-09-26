const Team = require('../models/Team');
const Racer = require('../models/Racer');

exports.createTeam = async (req, res) => {
  const { name, logo, country } = req.body;
  try {
    let team = await Team.findOne({ name });
    if (team) return res.status(400).json({ msg: 'Team name already exists' });

    team = new Team({
      name,
      logo,
      country,
      owner: req.user.id,
    });
    await team.save();

    res.json(team);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('owner', 'username');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateTeam = async (req, res) => {
  const { teamId } = req.params;
  const { name, logo, country } = req.body;
  try {
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ msg: 'Team not found' });
    if (team.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized' });

    team.name = name || team.name;
    team.logo = logo || team.logo;
    team.country = country || team.country;
    await team.save();

    res.json(team);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};