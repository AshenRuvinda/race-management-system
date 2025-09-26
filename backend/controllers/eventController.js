const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  const { raceId } = req.params;
  try {
    const events = await Event.find({ race: raceId }).sort({ createdAt: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};