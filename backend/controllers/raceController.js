const Race = require('../models/Race');
const RaceEntry = require('../models/RaceEntry');
const LapTime = require('../models/LapTime');
const PitStop = require('../models/PitStop');
const Event = require('../models/Event');

exports.createRace = async (req, res) => {
  const { venue, totalLaps, startingGrid, defaultTyreType } = req.body;
  try {
    const race = new Race({ venue, totalLaps, status: 'pending' });
    await race.save();

    const raceEntries = startingGrid.map((racerId, index) => ({
      race: race._id,
      racer: racerId,
      position: index + 1,
      tyreType: defaultTyreType,
    }));
    await RaceEntry.insertMany(raceEntries);

    res.json(race);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updatePosition = async (req, res) => {
  const { raceId, racerId, newPosition } = req.body;
  try {
    const raceEntry = await RaceEntry.findOne({ race: raceId, racer: racerId });
    raceEntry.position = newPosition;
    await raceEntry.save();

    const event = new Event({
      race: raceId,
      type: 'position_change',
      data: { racerId, newPosition },
    });
    await event.save();

    req.io.emit('raceUpdate', { raceId, event });
    res.json(raceEntry);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.markLap = async (req, res) => {
  const { raceId, racerId, lapTime } = req.body;
  try {
    const lap = new LapTime({ race: raceId, racer: racerId, lapTime });
    await lap.save();

    const event = new Event({
      race: raceId,
      type: 'lap_completed',
      data: { racerId, lapTime },
    });
    await event.save();

    req.io.emit('raceUpdate', { raceId, event });
    res.json(lap);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.markPitStop = async (req, res) => {
  const { raceId, racerId, tyreType, pitTime } = req.body;
  try {
    const pitStop = new PitStop({ race: raceId, racer: racerId, tyreType, pitTime });
    await pitStop.save();

    const raceEntry = await RaceEntry.findOne({ race: raceId, racer: racerId });
    raceEntry.tyreType = tyreType;
    await raceEntry.save();

    const event = new Event({
      race: raceId,
      type: 'pit_stop',
      data: { racerId, tyreType, pitTime },
    });
    await event.save();

    req.io.emit('raceUpdate', { raceId, event });
    res.json(pitStop);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.markDNF = async (req, res) => {
  const { raceId, racerId } = req.body;
  try {
    const raceEntry = await RaceEntry.findOne({ race: raceId, racer: racerId });
    raceEntry.status = 'DNF';
    await raceEntry.save();

    const event = new Event({
      race: raceId,
      type: 'dnf',
      data: { racerId },
    });
    await event.save();

    req.io.emit('raceUpdate', { raceId, event });
    res.json(raceEntry);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.finalizeRace = async (req, res) => {
  const { raceId } = req.body;
  try {
    const race = await Race.findById(raceId);
    race.status = 'completed';
    await race.save();

    const event = new Event({
      race: raceId,
      type: 'race_completed',
      data: {},
    });
    await event.save();

    req.io.emit('raceUpdate', { raceId, event });
    res.json(race);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};