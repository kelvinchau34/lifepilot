import React from 'react';
import { Activity, Brain, Calendar, DollarSign, Heart, BookOpen, Zap, Clock } from 'lucide-react';
import { Agent } from '../../../../utils/types';


interface ComingSoonProps {
  agent: Agent;
}

// Icon mapping for dynamic rendering
const ICON_MAP = {
  Brain,
  Calendar,
  DollarSign,
  Heart,
  BookOpen
};

export const ComingSoon: React.FC<ComingSoonProps> = ({ agent }) => {
  const IconComponent = ICON_MAP[agent.icon as keyof typeof ICON_MAP] || Brain;

  // Get AI-powered features based on agent type
  const getAgentFeatures = (agentId: string) => {
    const features = {
      executive: [
        'Smart task prioritization',
        'AI-powered scheduling',
        'Productivity analytics',
        'Goal tracking & insights'
      ],
      calendar: [
        'Intelligent scheduling',
        'Meeting optimization',
        'Time block suggestions',
        'Calendar conflict resolution'
      ],
      finance: [
        'Expense categorization',
        'Budget recommendations',
        'Financial insights',
        'Investment tracking'
      ],
      health: [
        'Personalized fitness plans',
        'Nutrition tracking',
        'Health metrics analysis',
        'Wellness recommendations'
      ],
      knowledge: [
        'Personalized recommendations',
        'Reading progress tracking',
        'Content discovery',
        'Learning insights'
      ]
    };
    return features[agentId as keyof typeof features] || [];
  };

  const features = getAgentFeatures(agent.id);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      {/* Main Agent Icon */}
      <div className={`${agent.color} p-8 rounded-2xl mb-8 shadow-lg transform hover:scale-105 transition-transform duration-200`}>
        <IconComponent className="w-16 h-16 text-white" />
      </div>

      {/* Agent Info */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{agent.name}</h2>
        <p className="text-xl text-gray-600 mb-2">{agent.description}</p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>AI Powered</span>
          </span>
          <span>•</span>
          <span>Status: {agent.status}</span>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 rounded-2xl border border-gray-200 shadow-sm max-w-lg w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
            <Activity className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h3>
        <p className="text-gray-600 mb-6">
          Our AI team is crafting intelligent {agent.description.toLowerCase()} 
          capabilities that will revolutionize how you manage your daily life.
        </p>

        {/* Features Preview */}
        {features.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Upcoming Features:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Development Timeline */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Expected Release: Q2 2024</span>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm mb-4">
          Want to be notified when this agent launches?
        </p>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
          Get Notified
        </button>
      </div>
    </div>
  );
};