const express = require('express');
const auth = require('../../middleware/auth');

const router = express.Router();

// @route   GET /api/agents/health/status
// @desc    Get health agent status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        agent: 'health',
        status: 'active',
        capabilities: [
          'Fitness Tracking',
          'Nutrition Analysis',
          'Health Metrics',
          'Workout Planning'
        ],
        dailySteps: 0,
        caloriesConsumed: 0,
        workoutsThisWeek: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health agent status'
    });
  }
});

module.exports = router;