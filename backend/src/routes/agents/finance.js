const express = require('express');
const auth = require('../../middleware/auth');

const router = express.Router();

// @route   GET /api/agents/finance/status
// @desc    Get finance agent status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        agent: 'finance',
        status: 'active',
        capabilities: [
          'Expense Tracking',
          'Budget Management',
          'Financial Insights',
          'Investment Monitoring'
        ],
        monthlyBudget: 0,
        totalExpenses: 0,
        savingsGoal: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching finance agent status'
    });
  }
});

module.exports = router;