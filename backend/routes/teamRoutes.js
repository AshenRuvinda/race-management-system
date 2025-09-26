const express = require('express');
const router = express.Router();
const { createTeam, getTeams, updateTeam } = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware(['owner']), createTeam);
router.get('/', authMiddleware(['admin', 'owner']), getTeams);
router.put('/:teamId', authMiddleware(['owner']), updateTeam);

module.exports = router;