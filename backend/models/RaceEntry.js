const mongoose = require('mongoose');

const raceEntrySchema = new mongoose.Schema({
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  racer: { type: mongoose.Schema.Types.ObjectId, ref: 'Racer', required: true },
  position: { type: Number, required: true },
  tyreType: { type: String, enum: ['soft', 'medium', 'hard'], required: true },
  status: { type: String, enum: ['active', 'DNF'], default: 'active' },
});

module.exports = mongoose.model('RaceEntry', raceEntrySchema);