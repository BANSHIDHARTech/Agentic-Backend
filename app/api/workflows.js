import express from 'express';
import { WorkflowService } from '../services/workflowService.js';
import { asyncHandler } from '../core/middleware.js';

export const workflowsRouter = express.Router();

// Create workflow with nodes and edges
workflowsRouter.post('/', asyncHandler(async (req, res) => {
  const result = await WorkflowService.createWorkflow(req.body);
  res.status(201).json(result);
}));

// Get all workflows
workflowsRouter.get('/', asyncHandler(async (req, res) => {
  const workflows = await WorkflowService.getAllWorkflows();
  res.json(workflows);
}));

// Get workflow by ID
workflowsRouter.get('/:id', asyncHandler(async (req, res) => {
  const workflow = await WorkflowService.getWorkflow(req.params.id);
  res.json(workflow);
}));

// Start a workflow with input
workflowsRouter.post('/run', asyncHandler(async (req, res) => {
  const { workflow_id, input } = req.body;
  const result = await WorkflowService.runWorkflow(workflow_id, input);
  res.json(result);
}));

// Execute one step and route to next
workflowsRouter.post('/step', asyncHandler(async (req, res) => {
  const { run_id, node_id, input } = req.body;
  const result = await WorkflowService.executeWorkflowStep(run_id, node_id, input);
  res.json(result);
}));

// Get workflow runs
workflowsRouter.get('/:id/runs', asyncHandler(async (req, res) => {
  const runs = await WorkflowService.getWorkflowRuns(req.params.id);
  res.json(runs);
}));

// Get specific workflow run
workflowsRouter.get('/runs/:runId', asyncHandler(async (req, res) => {
  const run = await WorkflowService.getWorkflowRun(req.params.runId);
  res.json(run);
}));