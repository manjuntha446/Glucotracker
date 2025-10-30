const Activity = require('../models/Activity');

// @desc    Get all activities for a user
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Add a new activity
// @route   POST /api/activities
// @access  Private
exports.addActivity = async (req, res) => {
  try {
    const { type, duration, intensity, caloriesBurned, date, notes } = req.body;

    const newActivity = await Activity.create({
      user: req.user.id,
      type,
      duration,
      intensity,
      caloriesBurned,
      date: date || new Date(),
      notes,
    });
    res.status(201).json({ success: true, data: newActivity });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, error: messages });
    } else {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
};

// @desc    Get activity trends (e.g., total duration per day/week/month)
// @route   GET /api/activities/trends
// @access  Private
exports.getActivityTrends = async (req, res) => {
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

    const trends = await Activity.aggregate([
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
          totalDuration: { $sum: '$duration' },
          avgCalories: { $avg: '$caloriesBurned' },
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
