const express = require('express');
const router = express.Router();
const { getEvents } = require('../controllers/eventController');

router.get('/:raceId', getEvents);

module.exports = router;