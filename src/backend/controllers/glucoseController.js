const Glucose = require('../models/Glucose');

// @desc    Get all glucose readings for a user
// @route   GET /api/glucose
// @access  Private
exports.getGlucoseReadings = async (req, res) => {
  try {
    const glucoseReadings = await Glucose.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: glucoseReadings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Add a new glucose reading
// @route   POST /api/glucose
// @access  Private
exports.addGlucoseReading = async (req, res) => {
  try {
    const { level, date } = req.body;
    const newReading = await Glucose.create({
      user: req.user.id,
      level,
      date: date || new Date(),
    });
    res.status(201).json({ success: true, data: newReading });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages });
    } else {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
};

// @desc    Get glucose trend data for a user
// @route   GET /api/glucose/trends
// @access  Private
exports.getGlucoseTrends = async (req, res) => {
  try {
    const { period } = req.query; // e.g., 'daily', 'weekly', 'monthly'
    let startDate;

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7); // Last 7 days
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - (now.getDay() + 7)); // Start of last week
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Start of last month
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30); // Default to last 30 days
        break;
    }

    const trends = await Glucose.aggregate([
      {
        $match: {
          user: req.user.id,
          date: { $gte: startDate, $lte: new Date() },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          avgLevel: { $avg: '$level' },
          minLevel: { $min: '$level' },
          maxLevel: { $max: '$level' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
