const express = require('express');
const router = express.Router();
const { getActivities, addActivity, getActivityTrends } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

// Get all activities for a user
router.get('/', protect, getActivities);

// Add a new activity
router.post('/', protect, addActivity);

// Get activity trends
router.get('/trends', protect, getActivityTrends);

module.exports = router;
