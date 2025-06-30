import express from 'express';
import { LogService } from '../services/logService.js';
import { asyncHandler } from '../core/middleware.js';

export const logsRouter = express.Router();

// View run logs
logsRouter.get('/', asyncHandler(async (req, res) => {
  const filters = {
    event_type: req.query.event_type,
    workflow_run_id: req.query.workflow_run_id,
    limit: req.query.limit ? parseInt(req.query.limit) : 100
  };
  
  const logs = await LogService.getLogs(filters);
  res.json(logs);
}));

// Get logs for specific workflow run
logsRouter.get('/workflow-run/:runId', asyncHandler(async (req, res) => {
  const logs = await LogService.getWorkflowRunLogs(req.params.runId);
  res.json(logs);
}));

// Get logs by event type
logsRouter.get('/event-type/:eventType', asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 100;
  const logs = await LogService.getLogsByEventType(req.params.eventType, limit);
  res.json(logs);
}));

// Create log entry
logsRouter.post('/', asyncHandler(async (req, res) => {
  const { event_type, details, workflow_run_id } = req.body;
  const result = await LogService.createLog(event_type, details, workflow_run_id);
  res.status(201).json(result);
}));

// Get log statistics
logsRouter.get('/stats', asyncHandler(async (req, res) => {
  const stats = await LogService.getLogStats();
  res.json(stats);
}));

// Delete old logs
logsRouter.delete('/cleanup', asyncHandler(async (req, res) => {
  const daysOld = req.query.days ? parseInt(req.query.days) : 30;
  await LogService.deleteOldLogs(daysOld);
  res.json({ message: `Logs older than ${daysOld} days deleted successfully` });
}));