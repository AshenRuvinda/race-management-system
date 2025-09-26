const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
  venue: { type: String, required: true },
  totalLaps: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'ongoing', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Race', raceSchema);