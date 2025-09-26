const mongoose = require('mongoose');

const racerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  country: { type: String, required: true },
  racingNumber: { type: Number, required: true },
  profilePicture: { type: String },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Racer', racerSchema);