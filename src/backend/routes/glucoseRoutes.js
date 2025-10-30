const express = require('express');
const router = express.Router();
const Glucose = require('../models/Glucose');
const User = require('../models/User');
const { sendEmail, sendGlucoseViewEmail } = require('../utils/emailService');
const { getGlucoseReadings, addGlucoseReading, getGlucoseTrends } = require('../controllers/glucoseController');
const { protect } = require('../middleware/authMiddleware');

// Get all glucose readings for a user (old route, now uses protect and controller)
router.get('/', protect, getGlucoseReadings);

// Get glucose trend data for a user (new route)
router.get('/trends', protect, getGlucoseTrends);

// Add a new glucose reading (old route, now uses protect and controller)
router.post('/', protect, addGlucoseReading);

// Get a specific glucose reading
router.get('/:id', protect, async (req, res) => {
  try {
    const reading = await Glucose.findById(req.params.id);
    if (!reading) {
      return res.status(404).json({ message: 'Glucose reading not found' });
    }
    // Ensure the reading belongs to the authenticated user
    if (reading.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to view this reading' });
    }
    res.json(reading);

    // Fire-and-forget email notification after sending response
    try {
      if (reading && reading.userId) { // Assuming userId is still used, otherwise use reading.user
        const user = await User.findById(reading.userId || reading.user);
        if (user) {
          sendGlucoseViewEmail(user, reading);
        }
      }
    } catch (e) {
      console.warn('Failed to queue glucose view email:', e.message);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a glucose reading
router.put('/:id', protect, async (req, res) => {
  try {
    let reading = await Glucose.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({ message: 'Glucose reading not found' });
    }

    // Make sure user owns the glucose reading
    if (reading.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this reading' });
    }

    const { value, unit, mealContext, notes, insulinDosage } = req.body;
    reading = await Glucose.findByIdAndUpdate(
      req.params.id,
      { value, unit, mealContext, notes, insulinDosage },
      { new: true, runValidators: true }
    );

    res.json(reading);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a glucose reading
router.delete('/:id', protect, async (req, res) => {
  try {
    let reading = await Glucose.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({ message: 'Glucose reading not found' });
    }

    // Make sure user owns the glucose reading
    if (reading.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this reading' });
    }

    await reading.remove();

    res.json({ message: 'Glucose reading deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get statistics for a user's glucose readings
router.get('/stats', protect, async (req, res) => { // Changed from /stats/user/:userId
  try {
    const userId = req.user.id; // Use authenticated user ID
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const readings = await Glucose.find({
      user: userId, // Changed from userId to user
      date: { $gte: startDate }, // Changed from timestamp to date
    });

    if (readings.length === 0) {
      return res.json({
        average: 0,
        min: 0,
        max: 0,
        count: 0,
        inRange: 0,
        aboveRange: 0,
        belowRange: 0,
      });
    }

    // Get user's target range
    const user = await User.findById(userId);
    const targetMin = user.targetGlucoseRange.min;
    const targetMax = user.targetGlucoseRange.max;

    // Calculate statistics
    const values = readings.map((r) => r.level); // Changed from r.value to r.level
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const inRange = readings.filter(
      (r) => r.level >= targetMin && r.level <= targetMax // Changed r.value to r.level
    ).length;
    const aboveRange = readings.filter((r) => r.level > targetMax).length; // Changed r.value to r.level
    const belowRange = readings.filter((r) => r.level < targetMin).length; // Changed r.value to r.level

    res.json({
      average: Math.round(average * 10) / 10,
      min,
      max,
      count: readings.length,
      inRange,
      aboveRange,
      belowRange,
      inRangePercentage: Math.round((inRange / readings.length) * 100),
      aboveRangePercentage: Math.round((aboveRange / readings.length) * 100),
      belowRangePercentage: Math.round((belowRange / readings.length) * 100),
    });
  } catch (error) {
    console.error(error); // Added console.error for debugging
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
