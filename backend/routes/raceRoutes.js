const express = require('express');
const router = express.Router();
const { createRace, updatePosition, markLap, markPitStop, markDNF, finalizeRace } = require('../controllers/raceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware(['admin']), createRace);
router.post('/position', authMiddleware(['admin']), updatePosition);
router.post('/lap', authMiddleware(['admin']), markLap);
router.post('/pitstop', authMiddleware(['admin']), markPitStop);
router.post('/dnf', authMiddleware(['admin']), markDNF);
router.post('/finalize', authMiddleware(['admin']), finalizeRace);

module.exports = router;