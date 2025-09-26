const mongoose = require('mongoose');

const pitStopSchema = new mongoose.Schema({
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  racer: { type: mongoose.Schema.Types.ObjectId, ref: 'Racer', required: true },
  tyreType: { type: String, enum: ['soft', 'medium', 'hard'], required: true },
  pitTime: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PitStop', pitStopSchema);