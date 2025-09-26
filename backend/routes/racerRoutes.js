const express = require('express');
const router = express.Router();
const { createRacer, getRacers, updateRacer } = require('../controllers/racerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware(['owner']), createRacer);
router.get('/', authMiddleware(['admin', 'owner']), getRacers);
router.put('/:racerId', authMiddleware(['owner']), updateRacer);

module.exports = router;