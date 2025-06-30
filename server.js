import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { agentsRouter } from './app/api/agents.js';
import { toolsRouter } from './app/api/tools.js';
import { workflowsRouter } from './app/api/workflows.js';
import { logsRouter } from './app/api/logs.js';
import { errorHandler } from './app/core/middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AgentFlow Backend'
  });
});

// API Routes
app.use('/api/agents', agentsRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/logs', logsRouter);

// Legacy routes for compatibility
app.use('/agents', agentsRouter);
app.use('/tools', toolsRouter);
app.use('/workflows', workflowsRouter);
app.use('/logs', logsRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AgentFlow Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📝 Test with: node scripts/test_workflow.js`);
});
