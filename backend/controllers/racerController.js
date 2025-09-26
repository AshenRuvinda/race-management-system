const Racer = require('../models/Racer');
const Team = require('../models/Team');

exports.createRacer = async (req, res) => {
  const { name, age, country, racingNumber, profilePicture, teamId } = req.body;
  try {
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ msg: 'Team not found' });
    if (team.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized' });

    const racerCount = await Racer.countDocuments({ team: teamId });
    if (racerCount >= 2) return res.status(400).json({ msg: 'Team already has maximum racers' });

    const racer = new Racer({
      name,
      age,
      country,
      racingNumber,
      profilePicture,
      team: teamId,
    });
    await racer.save();

    res.json(racer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getRacers = async (req, res) => {
  try {
    const racers = await Racer.find().populate('team', 'name');
    res.json(racers);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateRacer = async (req, res) => {
  const { racerId } = req.params;
  const { name, age, country, racingNumber, profilePicture } = req.body;
  try {
    const racer = await Racer.findById(racerId).populate('team');
    if (!racer) return res.status(404).json({ msg: 'Racer not found' });
    if (racer.team.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized' });

    racer.name = name || racer.name;
    racer.age = age || racer.age;
    racer.country = country || racer.country;
    racer.racingNumber = racingNumber || racer.racingNumber;
    racer.profilePicture = profilePicture || racer.profilePicture;
    await racer.save();

    res.json(racer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};