import { Agent } from '../types';

export const AGENTS: Agent[] = [
  {
    id: 'executive',
    name: 'Executive Agent',
    icon: 'Brain',
    color: 'bg-blue-500',
    description: 'Task Management & Planning',
    status: 'active'
  },
  {
    id: 'calendar',
    name: 'Calendar Agent',
    icon: 'Calendar',
    color: 'bg-green-500',
    description: 'Schedule Optimizer',
    status: 'active'
  },
  {
    id: 'finance',
    name: 'Finance Agent',
    icon: 'DollarSign',
    color: 'bg-yellow-500',
    description: 'Expense Tracker & Advisor',
    status: 'active'
  },
  {
    id: 'health',
    name: 'Health Agent',
    icon: 'Heart',
    color: 'bg-red-500',
    description: 'Fitness & Diet Tracking',
    status: 'active'
  },
  {
    id: 'knowledge',
    name: 'Knowledge Agent',
    icon: 'BookOpen',
    color: 'bg-purple-500',
    description: 'Books, Movies & Recommendations',
    status: 'active'
  }
];

// Icon mapping for dynamic imports
export const ICON_MAP = {
  Brain: 'Brain',
  Calendar: 'Calendar', 
  DollarSign: 'DollarSign',
  Heart: 'Heart',
  BookOpen: 'BookOpen'
} as const;