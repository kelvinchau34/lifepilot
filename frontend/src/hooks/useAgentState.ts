import { useState, useCallback } from 'react';
import { AGENTS } from '../utils/constants/agents';
import { Agent } from '../utils/types';

export const useAgentState = () => {
  const [activeAgent, setActiveAgent] = useState<string>('executive');
  const [agents] = useState<Agent[]>(AGENTS);

  // Switch to a different agent
  const switchAgent = useCallback((agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent && agent.status === 'active') {
      setActiveAgent(agentId);
    } else {
      console.warn(`Agent ${agentId} not found or not active`);
    }
  }, [agents]);

  // Get the currently active agent
  const getCurrentAgent = useCallback((): Agent | undefined => {
    return agents.find(a => a.id === activeAgent);
  }, [activeAgent, agents]);

  // Get agent by ID
  const getAgentById = useCallback((agentId: string): Agent | undefined => {
    return agents.find(a => a.id === agentId);
  }, [agents]);

  // Check if an agent is active
  const isAgentActive = useCallback((agentId: string): boolean => {
    return activeAgent === agentId;
  }, [activeAgent]);

  // Get agents by status
  const getAgentsByStatus = useCallback((status: Agent['status']): Agent[] => {
    return agents.filter(a => a.status === status);
  }, [agents]);

  return {
    // State
    activeAgent,
    agents,
    
    // Actions
    switchAgent,
    
    // Getters
    getCurrentAgent,
    getAgentById,
    isAgentActive,
    getAgentsByStatus,
    
    // Computed values
    activeAgentData: getCurrentAgent(),
    activeAgentsCount: getAgentsByStatus('active').length,
    totalAgentsCount: agents.length
  };
};

export default useAgentState;