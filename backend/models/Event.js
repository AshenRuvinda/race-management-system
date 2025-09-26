const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  type: { 
    type: String, 
    enum: [
      'position_change', 
      'lap_completed', 
      'pit_stop', 
      'dnf', 
      'race_completed', 
      'race_created',
      'race_started'  // Added new event type
    ], 
    required: true 
  },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', eventSchema);