import express from 'express';
import { AgentService } from '../services/agentService.js';
import { asyncHandler } from '../core/middleware.js';

export const agentsRouter = express.Router();

// Create or update agent
agentsRouter.post('/', asyncHandler(async (req, res) => {
  const { id, ...agentData } = req.body;
  
  let result;
  if (id) {
    result = await AgentService.updateAgent(id, agentData);
  } else {
    result = await AgentService.createAgent(agentData);
  }
  
  res.status(201).json(result);
}));

// Get all agents
agentsRouter.get('/', asyncHandler(async (req, res) => {
  const agents = await AgentService.getAllAgents();
  res.json(agents);
}));

// Get agent by ID
agentsRouter.get('/:id', asyncHandler(async (req, res) => {
  const agent = await AgentService.getAgent(req.params.id);
  res.json(agent);
}));

// Update agent
agentsRouter.put('/:id', asyncHandler(async (req, res) => {
  const result = await AgentService.updateAgent(req.params.id, req.body);
  res.json(result);
}));

// Delete agent
agentsRouter.delete('/:id', asyncHandler(async (req, res) => {
  await AgentService.deleteAgent(req.params.id);
  res.json({ message: 'Agent deleted successfully' });
}));

// Find agents by intent
agentsRouter.get('/intent/:intent', asyncHandler(async (req, res) => {
  const agents = await AgentService.findAgentByIntent(req.params.intent);
  res.json(agents);
}));

// Execute agent directly
agentsRouter.post('/:id/execute', asyncHandler(async (req, res) => {
  const agent = await AgentService.getAgent(req.params.id);
  const result = await AgentService.executeAgent(agent, req.body);
  res.json(result);
}));