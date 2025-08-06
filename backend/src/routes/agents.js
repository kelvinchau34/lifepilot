const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
router.get('/', auth, async (req, res) => {
  try {
    const agents = [
      {
        id: 'executive',
        name: 'Executive Agent',
        icon: 'Brain',
        color: 'bg-blue-500',
        description: 'Task Management & Planning',
        status: 'active',
        enabled: req.user.agentSettings?.executive?.enabled ?? true,
        lastActivity: new Date(),
        capabilities: ['Task Management', 'Goal Tracking', 'Priority Analysis']
      },
      {
        id: 'calendar',
        name: 'Calendar Agent',
        icon: 'Calendar',
        color: 'bg-green-500',
        description: 'Schedule Optimizer',
        status: 'active',
        enabled: req.user.agentSettings?.calendar?.enabled ?? true,
        lastActivity: new Date(),
        capabilities: ['Schedule Management', 'Meeting Optimization', 'Time Blocking']
      },
      {
        id: 'finance',
        name: 'Finance Agent',
        icon: 'DollarSign',
        color: 'bg-yellow-500',
        description: 'Expense Tracker & Advisor',
        status: 'active',
        enabled: req.user.agentSettings?.finance?.enabled ?? true,
        lastActivity: new Date(),
        capabilities: ['Expense Tracking', 'Budget Management', 'Financial Insights']
      },
      {
        id: 'health',
        name: 'Health Agent',
        icon: 'Heart',
        color: 'bg-red-500',
        description: 'Fitness & Diet Tracking',
        status: 'active',
        enabled: req.user.agentSettings?.health?.enabled ?? true,
        lastActivity: new Date(),
        capabilities: ['Fitness Tracking', 'Nutrition Analysis', 'Health Metrics']
      },
      {
        id: 'knowledge',
        name: 'Knowledge Agent',
        icon: 'BookOpen',
        color: 'bg-purple-500',
        description: 'Books, Movies & Recommendations',
        status: 'active',
        enabled: req.user.agentSettings?.knowledge?.enabled ?? true,
        lastActivity: new Date(),
        capabilities: ['Content Discovery', 'Progress Tracking', 'Recommendations']
      }
    ];

    res.json({
      success: true,
      data: {
        agents,
        summary: {
          total: agents.length,
          active: agents.filter(a => a.status === 'active').length,
          enabled: agents.filter(a => a.enabled).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching agents'
    });
  }
});

// @route   PUT /api/agents/:agentId/settings
// @desc    Update agent settings
// @access  Private
router.put('/:agentId/settings', auth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const validAgents = ['executive', 'calendar', 'finance', 'health', 'knowledge'];
    
    if (!validAgents.includes(agentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    const updateField = `agentSettings.${agentId}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { [updateField]: req.body } },
      { new: true }
    );

    res.json({
      success: true,
      message: `${agentId} agent settings updated`,
      data: {
        settings: user.agentSettings[agentId]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating agent settings'
    });
  }
});

module.exports = router;
