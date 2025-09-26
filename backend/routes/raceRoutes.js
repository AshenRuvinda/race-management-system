const express = require('express');
const router = express.Router();
const { 
  createRace, 
  updatePosition, 
  markLap, 
  markPitStop, 
  markDNF, 
  finalizeRace,
  startRace,  // Add this import
  getRaces,
  getRaceById,
  getRaceEntries 
} = require('../controllers/raceController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all races
router.get('/', authMiddleware(['admin', 'owner']), getRaces);

// Get specific race
router.get('/:raceId', authMiddleware(['admin', 'owner']), getRaceById);

// Get race entries
router.get('/:raceId/entries', getRaceEntries);

// Admin only routes
router.post('/create', authMiddleware(['admin']), createRace);
router.post('/start', authMiddleware(['admin']), startRace);  // Add this route
router.post('/position', authMiddleware(['admin']), updatePosition);
router.post('/lap', authMiddleware(['admin']), markLap);
router.post('/pitstop', authMiddleware(['admin']), markPitStop);
router.post('/dnf', authMiddleware(['admin']), markDNF);
router.post('/finalize', authMiddleware(['admin']), finalizeRace);

module.exports = router;