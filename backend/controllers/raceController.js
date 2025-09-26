const Race = require('../models/Race');
const RaceEntry = require('../models/RaceEntry');
const LapTime = require('../models/LapTime');
const PitStop = require('../models/PitStop');
const Event = require('../models/Event');
const Racer = require('../models/Racer'); // Add this import

exports.createRace = async (req, res) => {
  const { venue, totalLaps, startingGrid, defaultTyreType } = req.body;
  
  try {
    console.log('Creating race with data:', { venue, totalLaps, startingGrid, defaultTyreType });

    // Enhanced validation
    if (!venue || !totalLaps || !startingGrid || !Array.isArray(startingGrid)) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ 
        msg: 'Invalid race data provided',
        details: {
          venue: !venue ? 'Venue is required' : null,
          totalLaps: !totalLaps ? 'Total laps is required' : null,
          startingGrid: !startingGrid ? 'Starting grid is required' : !Array.isArray(startingGrid) ? 'Starting grid must be an array' : null
        }
      });
    }

    const parsedTotalLaps = parseInt(totalLaps);
    if (isNaN(parsedTotalLaps) || parsedTotalLaps < 1 || parsedTotalLaps > 200) {
      console.log('Validation failed: Invalid total laps:', totalLaps);
      return res.status(400).json({ msg: 'Total laps must be between 1 and 200' });
    }

    if (startingGrid.length < 2) {
      console.log('Validation failed: Not enough racers:', startingGrid.length);
      return res.status(400).json({ msg: 'At least 2 racers required for a race' });
    }

    // Validate tyre type
    const validTyreTypes = ['soft', 'medium', 'hard'];
    const tyreType = defaultTyreType || 'medium';
    if (!validTyreTypes.includes(tyreType)) {
      console.log('Validation failed: Invalid tyre type:', defaultTyreType);
      return res.status(400).json({ msg: 'Invalid tyre type. Must be soft, medium, or hard' });
    }

    // Validate that all racers exist
    console.log('Validating racers exist...');
    const existingRacers = await Racer.find({ _id: { $in: startingGrid } });
    console.log('Found racers:', existingRacers.length, 'Expected:', startingGrid.length);
    
    if (existingRacers.length !== startingGrid.length) {
      const existingRacerIds = existingRacers.map(r => r._id.toString());
      const missingRacers = startingGrid.filter(id => !existingRacerIds.includes(id.toString()));
      console.log('Missing racers:', missingRacers);
      return res.status(400).json({ 
        msg: 'Some racers do not exist',
        missingRacers 
      });
    }

    // Check for duplicate racers
    const uniqueRacers = [...new Set(startingGrid)];
    if (uniqueRacers.length !== startingGrid.length) {
      console.log('Validation failed: Duplicate racers in starting grid');
      return res.status(400).json({ msg: 'Duplicate racers in starting grid are not allowed' });
    }

    console.log('All validations passed, creating race...');

    // Create race
    const race = new Race({ 
      venue: venue.trim(), 
      totalLaps: parsedTotalLaps, 
      status: 'pending' 
    });
    
    console.log('Saving race to database...');
    const savedRace = await race.save();
    console.log('Race saved successfully:', savedRace._id);

    // Create race entries
    console.log('Creating race entries...');
    const raceEntries = startingGrid.map((racerId, index) => ({
      race: savedRace._id,
      racer: racerId,
      position: index + 1,
      tyreType: tyreType,
      status: 'active'
    }));
    
    console.log('Race entries to create:', raceEntries);
    const savedEntries = await RaceEntry.insertMany(raceEntries);
    console.log('Race entries created successfully:', savedEntries.length);

    // Create race creation event
    console.log('Creating race event...');
    const event = new Event({
      race: savedRace._id,
      type: 'race_created',
      data: { 
        venue: venue.trim(), 
        totalLaps: parsedTotalLaps, 
        racerCount: startingGrid.length,
        defaultTyreType: tyreType
      },
    });
    
    const savedEvent = await event.save();
    console.log('Race event created successfully:', savedEvent._id);

    console.log('Race creation completed successfully');
    res.status(201).json({
      success: true,
      race: savedRace,
      message: 'Race created successfully'
    });

  } catch (err) {
    console.error('Create race error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });

    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        msg: 'Validation error', 
        errors: validationErrors 
      });
    }

    if (err.name === 'CastError') {
      return res.status(400).json({ 
        msg: 'Invalid data format',
        field: err.path,
        value: err.value
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({ 
        msg: 'Duplicate entry error',
        details: err.keyValue
      });
    }

    // Generic server error
    res.status(500).json({ 
      msg: 'Server error while creating race',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Enhanced error handling for other methods as well
exports.getRaces = async (req, res) => {
  try {
    console.log('Fetching all races...');
    const races = await Race.find().sort({ createdAt: -1 });
    console.log('Found races:', races.length);
    res.json(races);
  } catch (err) {
    console.error('Get races error:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      msg: 'Server error while fetching races',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.getRaceById = async (req, res) => {
  const { raceId } = req.params;
  
  try {
    console.log('Fetching race by ID:', raceId);
    
    // Validate ObjectId format
    if (!raceId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid race ID format' });
    }
    
    const race = await Race.findById(raceId);
    if (!race) {
      console.log('Race not found:', raceId);
      return res.status(404).json({ msg: 'Race not found' });
    }
    
    console.log('Race found:', race._id);
    res.json(race);
  } catch (err) {
    console.error('Get race by ID error:', {
      raceId,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      msg: 'Server error while fetching race',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.getRaceEntries = async (req, res) => {
  const { raceId } = req.params;
  
  try {
    console.log('Fetching race entries for race:', raceId);
    
    // Validate ObjectId format
    if (!raceId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid race ID format' });
    }
    
    const entries = await RaceEntry.find({ race: raceId })
      .populate({
        path: 'racer',
        populate: {
          path: 'team',
          select: 'name logo country'
        }
      })
      .sort({ position: 1 });
    
    console.log('Found race entries:', entries.length);
    res.json(entries);
  } catch (err) {
    console.error('Get race entries error:', {
      raceId,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      msg: 'Server error while fetching race entries',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Keep other existing methods with similar error handling improvements...
exports.updatePosition = async (req, res) => {
  const { raceId, racerId, newPosition } = req.body;
  
  try {
    console.log('Updating position:', { raceId, racerId, newPosition });
    
    // Validation
    if (!raceId || !racerId || !newPosition) {
      return res.status(400).json({ msg: 'Missing required fields: raceId, racerId, newPosition' });
    }

    const parsedPosition = parseInt(newPosition);
    if (isNaN(parsedPosition) || parsedPosition < 1) {
      return res.status(400).json({ msg: 'Position must be a positive number' });
    }

    const raceEntry = await RaceEntry.findOne({ race: raceId, racer: racerId });
    if (!raceEntry) {
      return res.status(404).json({ msg: 'Race entry not found' });
    }

    const oldPosition = raceEntry.position;
    raceEntry.position = parsedPosition;
    await raceEntry.save();

    // Create event
    const event = new Event({
      race: raceId,
      type: 'position_change',
      data: { racerId, oldPosition, newPosition: parsedPosition },
    });
    await event.save();

    // Emit socket event if available
    if (req.io) {
      req.io.emit('raceUpdate', { raceId, event });
    }

    res.json(raceEntry);
  } catch (err) {
    console.error('Update position error:', {
      requestData: { raceId, racerId, newPosition },
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      msg: 'Server error while updating position',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.markLap = async (req, res) => {
  const { raceId, racerId, lapTime } = req.body;
  
  try {
    console.log('Marking lap:', { raceId, racerId, lapTime });
    
    // Validation
    if (!raceId || !racerId || !lapTime) {
      return res.status(400).json({ msg: 'Missing required fields: raceId, racerId, lapTime' });
    }

    const parsedLapTime = parseFloat(lapTime);
    if (isNaN(parsedLapTime) || parsedLapTime <= 0 || parsedLapTime > 300) {
      return res.status(400).json({ msg: 'Invalid lap time - must be between 0 and 300 seconds' });
    }

    const lap = new LapTime({ 
      race: raceId, 
      racer: racerId, 
      lapTime: parsedLapTime 
    });
    await lap.save();

    const event = new Event({
      race: raceId,
      type: 'lap_completed',
      data: { racerId, lapTime: parsedLapTime },
    });
    await event.save();

    if (req.io) {
      req.io.emit('raceUpdate', { raceId, event });
    }

    res.json(lap);
  } catch (err) {
    console.error('Mark lap error:', {
      requestData: { raceId, racerId, lapTime },
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      msg: 'Server error while marking lap',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.markPitStop = async (req, res) => {
  const { raceId, racerId, tyreType, pitTime } = req.body;
  
  try {
    console.log('Marking pit stop:', { raceId, racerId, tyreType, pitTime });
    
    // Validation
    if (!raceId || !racerId || !tyreType || !pitTime) {
      return res.status(400).json({ msg: 'Missing required fields: raceId, racerId, tyreType, pitTime' });
    }

    if (!['soft', 'medium', 'hard'].includes(tyreType)) {
      return res.status(400).json({ msg: 'Invalid tyre type - must be soft, medium, or hard' });
    }

    const parsedPitTime = parseFloat(pitTime);
    if (isNaN(parsedPitTime) || parsedPitTime <= 0 || parsedPitTime > 60) {
      return res.status(400).json({ msg: 'Invalid pit time - must be between 0 and 60 seconds' });
    }

    const pitStop = new PitStop({ 
      race: raceId, 
      racer: racerId, 
      tyreType, 
      pitTime: parsedPitTime 
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
      data: { racerId, tyreType, pitTime: parsedPitTime },
    });
    await event.save();

    if (req.io) {
      req.io.emit('raceUpdate', { raceId, event });
    }

    res.json(pitStop);
  } catch (err) {
    console.error('Mark pit stop error:', {
      requestData: { raceId, racerId, tyreType, pitTime },
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      msg: 'Server error while marking pit stop',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.markDNF = async (req, res) => {
  const { raceId, racerId } = req.body;
  
  try {
    console.log('Marking DNF:', { raceId, racerId });
    
    if (!raceId || !racerId) {
      return res.status(400).json({ msg: 'Missing required fields: raceId, racerId' });
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
    console.error('Mark DNF error:', {
      requestData: { raceId, racerId },
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      msg: 'Server error while marking DNF',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.finalizeRace = async (req, res) => {
  const { raceId } = req.body;
  
  try {
    console.log('Finalizing race:', raceId);
    
    if (!raceId) {
      return res.status(400).json({ msg: 'Race ID is required' });
    }

    const race = await Race.findById(raceId);
    if (!race) {
      return res.status(404).json({ msg: 'Race not found' });
    }

    if (race.status === 'completed') {
      return res.status(400).json({ msg: 'Race is already completed' });
    }

    race.status = 'completed';
    await race.save();

    const event = new Event({
      race: raceId,
      type: 'race_completed',
      data: { completedAt: new Date() },
    });
    await event.save();

    if (req.io) {
      req.io.emit('raceUpdate', { raceId, event });
    }

    res.json(race);
  } catch (err) {
    console.error('Finalize race error:', {
      raceId,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      msg: 'Server error while finalizing race',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Add this to your raceController.js file

exports.startRace = async (req, res) => {
  const { raceId } = req.body;
  
  try {
    console.log('Starting race:', raceId);
    
    if (!raceId) {
      return res.status(400).json({ msg: 'Race ID is required' });
    }

    const race = await Race.findById(raceId);
    if (!race) {
      return res.status(404).json({ msg: 'Race not found' });
    }

    if (race.status !== 'pending') {
      return res.status(400).json({ 
        msg: `Race cannot be started. Current status: ${race.status}` 
      });
    }

    // Check if race has entries
    const raceEntries = await RaceEntry.find({ race: raceId });
    if (raceEntries.length === 0) {
      return res.status(400).json({ 
        msg: 'Cannot start race with no participants' 
      });
    }

    // Update race status to ongoing
    race.status = 'ongoing';
    await race.save();

    // Create race start event
    const event = new Event({
      race: raceId,
      type: 'race_started',
      data: { 
        startedAt: new Date(),
        participantCount: raceEntries.length
      },
    });
    await event.save();

    // Emit socket event if available
    if (req.io) {
      req.io.emit('raceUpdate', { raceId, event });
    }

    console.log('Race started successfully:', raceId);
    res.json({
      success: true,
      race,
      message: 'Race started successfully'
    });
  } catch (err) {
    console.error('Start race error:', {
      raceId,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      msg: 'Server error while starting race',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};