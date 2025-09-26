const mongoose = require('mongoose');

const lapTimeSchema = new mongoose.Schema({
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  racer: { type: mongoose.Schema.Types.ObjectId, ref: 'Racer', required: true },
  lapTime: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LapTime', lapTimeSchema);