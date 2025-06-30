import express from 'express';
import { ToolService } from '../services/toolService.js';
import { asyncHandler } from '../core/middleware.js';

export const toolsRouter = express.Router();

// Register a callable tool
toolsRouter.post('/', asyncHandler(async (req, res) => {
  const result = await ToolService.createTool(req.body);
  res.status(201).json(result);
}));

// Get all tools
toolsRouter.get('/', asyncHandler(async (req, res) => {
  const tools = await ToolService.getAllTools();
  res.json(tools);
}));

// Get tool by ID
toolsRouter.get('/:id', asyncHandler(async (req, res) => {
  const tool = await ToolService.getTool(req.params.id);
  res.json(tool);
}));

// Update tool
toolsRouter.put('/:id', asyncHandler(async (req, res) => {
  const result = await ToolService.updateTool(req.params.id, req.body);
  res.json(result);
}));

// Delete tool
toolsRouter.delete('/:id', asyncHandler(async (req, res) => {
  await ToolService.deleteTool(req.params.id);
  res.json({ message: 'Tool deleted successfully' });
}));

// Execute tool
toolsRouter.post('/:id/execute', asyncHandler(async (req, res) => {
  const result = await ToolService.executeTool(req.params.id, req.body);
  res.json(result);
}));

// Register builtin tools
toolsRouter.post('/register-builtin', asyncHandler(async (req, res) => {
  const result = await ToolService.registerBuiltinTools();
  res.json({ 
    message: 'Builtin tools registered successfully',
    tools: result
  });
}));