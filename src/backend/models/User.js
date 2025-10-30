const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  diabetesType: {
    type: String,
    enum: ['type1', 'type2', 'gestational', 'prediabetes', 'other']
  },
  targetGlucoseRange: {
    min: {
      type: Number,
      default: 70 // mg/dL
    },
    max: {
      type: Number,
      default: 180 // mg/dL
    }
  },
  insulinSensitivityFactor: {
    type: Number,
    default: 50 // mg/dL per unit of insulin
  },
  carbRatio: {
    type: Number,
    default: 15 // grams of carbs per unit of insulin
  },
  guardianContact: {
    name: String,
    email: String,
    phone: String,
    relationship: String
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    alertThreshold: {
      high: {
        type: Number,
        default: 250 // mg/dL
      },
      low: {
        type: Number,
        default: 60 // mg/dL
      }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);