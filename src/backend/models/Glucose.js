const mongoose = require('mongoose');

const GlucoseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['mg/dL', 'mmol/L'],
    default: 'mg/dL'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  mealContext: {
    type: String,
    enum: ['before_breakfast', 'after_breakfast', 'before_lunch', 'after_lunch', 'before_dinner', 'after_dinner', 'bedtime', 'other'],
    default: 'other'
  },
  notes: {
    type: String
  },
  insulinDosage: {
    type: Number,
    default: 0
  },
  recommendedInsulinDosage: {
    type: Number,
    default: 0
  },
  recommendedActivity: {
    type: String,
    default: ''
  },
  alertSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Glucose', GlucoseSchema);