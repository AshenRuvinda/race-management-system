const Race = require('../models/Race');
const RaceEntry = require('../models/RaceEntry');
const LapTime = require('../models/LapTime');
const PitStop = require('../models/PitStop');
const Event = require('../models/Event');

// Get all races
exports.getRaces = async (req, res) => {
  try {
    const races = await Race.find().sort({ createdAt: -1 });
    res.json(races);
  } catch (err) {
    console.error('Get races error:', err);
    res.status(500).json({ msg: 'Server error while fetching races' });
  }
};

// Get race by ID
exports.getRaceById = async (req, res) => {
  const { raceId } = req.params;
  try {
    const race = await Race.findById(raceId);
    if (!race) {
      return res.status(404).json({ msg: 'Race not found' });
    }
    res.json(race);
  } catch (err) {
    console.error('Get race by ID error:', err);
    res.status(500).json({ msg: 'Server error while fetching race' });
  }
};

// Get race entries with populated data
exports.getRaceEntries = async (req, res) => {
  const { raceId } = req.params;
  try {
    const entries = await RaceEntry.find({ race: raceId })
      .populate({
        path: 'racer',
        populate: {
          path: 'team',
          select: 'name logo country'
        }
      })
      .sort({ position: 1 });
    
    res.json(entries);
  } catch (err) {
    console.error('Get race entries error:', err);
    res.status(500).json({ msg: 'Server error while fetching race entries' });
  }
};

exports.createRace = async (req, res) => {
  const { venue, totalLaps, startingGrid, defaultTyreType } = req.body;
  
  try {
    // Validation
    if (!venue || !totalLaps || !startingGrid || !Array.isArray(startingGrid)) {
      return res.status(400).json({ msg: 'Invalid race data provided' });
    }

    if (totalLaps < 1 || totalLaps > 200) {
      return res.status(400).json({ msg: 'Total laps must be between 1 and 200' });
    }

    if (startingGrid.length < 2) {
      return res.status(400).json({ msg: 'At least 2 racers required for a race' });
    }

    // Create race
    const race = new Race({ 
      venue: venue.trim(), 
      totalLaps: parseInt(totalLaps), 
      status: 'pending' 
    });
    await race.save();

    // Create race entries
    const raceEntries = startingGrid.map((racerId, index) => ({
      race: race._id,
      racer: racerId,
      position: index + 1,
      tyreType: defaultTyreType || 'medium',
    }));
    
    await RaceEntry.insertMany(raceEntries);

    // Create race creation event
    const event = new Event({
      race: race._id,
      type: 'race_created',
      data: { venue, totalLaps, racerCount: startingGrid.length },
    });
    await event.save();

    res.status(201).json(race);
  } catch (err) {
    console.error('Create race error:', err);
    res.status(500).json({ msg: 'Server error while creating race' });
  }
};

exports.updatePosition = async (req, res) => {
  const { raceId, racerId, newPosition } = req.body;
  
  try {
    // Validation
    if (!raceId || !racerId || !newPosition) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const raceEntry = await RaceEntry.findOne({ race: raceId, racer: racerId });
    if (!raceEntry) {
      return res.status(404).json({ msg: 'Race entry not found' });
    }

    const oldPosition = raceEntry.position;
    raceEntry.position = parseInt(newPosition);
    await raceEntry.save();

    // Create event
    const event = new Event({
      race: raceId,
      type: 'position_change',
      data: { racerId, oldPosition, newPosition: parseInt(newPosition) },
    });
    await event.save();

    // Emit socket event if available
    if (req.io) {
      req.io.emit('raceUpdate', { raceId, event });
    }

    res.json(raceEntry);
  } catch (err) {
    console.error('Update position error:', err);
    res.status(500).json({ msg: 'Server error while updating position' });
  }
};

exports.markLap = async (req, res) => {
  const { raceId, racerId, lapTime } = req.body;
  
  try {
    // Validation
    if (!raceId || !racerId || !lapTime) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    if (lapTime <= 0 || lapTime > 300) {
      return res.status(400).json({ msg: 'Invalid lap time' });
    }

    const lap = new LapTime({ 
      race: raceId, 
      racer: racerId, 
      lapTime: parseFloat(lapTime) 
    });
    await lap.save();

    const event = new Event({
      race: raceId,
      type: 'lap_completed',
      data: { racerId, lapTime: parseFloat(lapTime) },
    });
    await event.save();

    if (req.io) {
      req.io.emit('raceUpdate', { raceId, event });
    }

    res.json(lap);
  } catch (err) {
    console.error('Mark lap error:', err);
    res.status(500).json({ msg: 'Server error while marking lap' });
  }
};

exports.markPitStop = async (req, res) => {
  const { raceId, racerId, tyreType, pitTime } = req.body;
  
  try {
    // Validation
    if (!raceId || !racerId || !tyreType || !pitTime) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    if (!['soft', 'medium', 'hard'].includes(tyreType)) {
      return res.status(400).json({ msg: 'Invalid tyre type' });
    }

    if (pitTime <= 0 || pitTime > 60) {
      return res.status(400).json({ msg: 'Invalid pit time' });
    }

    const pitStop = new PitStop({ 
      race: raceId, 
      racer: racerId, 
      tyreType, 
      pitTime: parseFloat(pitTime) 
    });
    await pitStop.save();

    // Update racer's current tyre type
    const raceEntry = await RaceEntry.findOne({ race: raceId, racer: racerId });
    if (raceEntry) {
      raceEntry.tyreType = tyreType;
      await raceEntry.save();
    }

    const event = new Event({
      race: raceId,
      type: 'pit_stop',
      data: { racerId, tyreType, pitTime: parseFloat(pitTime) },
    });
    await event.save();

    if (req.io) {
      req.io.emit('raceUpdate', { raceId, event });
    }

    res.json(pitStop);
  } catch (err) {
    console.error('Mark pit stop error:', err);
    res.status(500).json({ msg: 'Server error while marking pit stop' });
  }
};

exports.markDNF = async (req, res) => {
  const { raceId, racerId } = req.body;
  
  try {
    if (!raceId || !racerId) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const raceEntry = await RaceEntry.findOne({ race: raceId, racer: racerId });
    if (!raceEntry) {
      return res.status(404).json({ msg: 'Race entry not found' });
    }

    raceEntry.status = 'DNF';
    await raceEntry.save();

    const event = new Event({
      race: raceId,
      type: 'dnf',
      data: { racerId },
    });
    await event.save();

    if (req.io) {
      req.io.emit('raceUpdate', { raceId, event });
    }

    res.json(raceEntry);
  } catch (err) {
    console.error('Mark DNF error:', err);
    res.status(500).json({ msg: 'Server error while marking DNF' });
  }
};

exports.finalizeRace = async (req, res) => {
  const { raceId } = req.body;
  
  try {
    if (!raceId) {
      return res.status(400).json({ msg: 'Race ID is required' });
    }

    const race = await Race.findById(raceId);
    if (!race) {
      return res.status(404).json({ msg: 'Race not found' });
    }

    race.status = 'completed';
    await race.save();

    const event = new Event({
      race: raceId,
      type: 'race_completed',
      data: {},
    });
    await event.save();

    if (req.io) {
      req.io.emit('raceUpdate', { raceId, event });
    }

    res.json(race);
  } catch (err) {
    console.error('Finalize race error:', err);
    res.status(500).json({ msg: 'Server error while finalizing race' });
  }
};