const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: [true, 'Please add an activity type'],
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'Please add duration in minutes'],
    min: 1,
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate',
  },
  caloriesBurned: {
    type: Number,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes can not be more than 200 characters'],
  },
});

module.exports = mongoose.model('Activity', ActivitySchema);
