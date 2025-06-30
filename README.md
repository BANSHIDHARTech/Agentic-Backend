# AgentFlow - AI Agent Orchestration Platform

A fully dynamic AI agent orchestration platform built with Node.js, Express, and Supabase. AgentFlow enables you to create, manage, and execute complex AI workflows with intelligent agent chaining and tool integration.

## 🚀 Features

- **Dynamic Agent Management**: Create and configure AI agents with custom prompts and capabilities
- **Intelligent Workflow Orchestration**: Build complex workflows using directed acyclic graphs (DAG)
- **Intent-Based Routing**: Agents communicate through intents for seamless workflow transitions
- **Tool Integration**: Register and execute custom tools within agent workflows
- **Real-time Logging**: Comprehensive logging and monitoring of workflow executions
- **Database-Driven**: Fully configurable through Supabase PostgreSQL database

## 🏗️ Architecture

```
app/
├── api/          # REST API endpoints
├── core/         # Core utilities and middleware
├── services/     # Business logic services
└── agents/       # Agent-specific logic
```

## 🛠️ Tech Stack

- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Validation**: Custom validation middleware
- **Logging**: Structured logging with Supabase

## 📋 Database Schema

### Core Tables
- `agents` - AI agent definitions with prompts and capabilities
- `tools` - Callable functions that agents can execute
- `workflows` - Workflow definitions and metadata
- `workflow_nodes` - Agents within workflows
- `workflow_edges` - Transitions between workflow nodes
- `workflow_runs` - Execution instances and results
- `logs` - Comprehensive execution logging

## 🔧 API Endpoints

### Agents
- `POST /api/agents/` - Create or update agent
- `GET /api/agents/` - Get all agents
- `GET /api/agents/:id` - Get agent by ID
- `DELETE /api/agents/:id` - Delete agent

### Tools
- `POST /api/tools/` - Register a callable tool
- `GET /api/tools/` - Get all tools
- `POST /api/tools/:id/execute` - Execute tool

### Workflows
- `POST /api/workflows/` - Create workflow with nodes and edges
- `GET /api/workflows/` - Get all workflows
- `POST /api/workflows/run` - Start workflow execution
- `GET /api/workflows/:id/runs` - Get workflow run history

### Logs
- `GET /api/logs/` - View execution logs
- `GET /api/logs/workflow-run/:runId` - Get logs for specific run

## 🚦 Quick Start

1. **Setup Supabase**:
   - Create a new Supabase project
   - Run the provided migrations
   - Update `.env` with your Supabase credentials

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Server**:
   ```bash
   npm run dev
   ```

4. **Test the Setup**:
   ```bash
   node scripts/test_workflow.js
   ```

## 🎯 Sample Workflow

The system includes a sample "Customer Service Workflow":

```
RouterAgent → AuthAgent → PostpaidBalanceAgent → StopAgent
```

This workflow:
1. Routes incoming queries
2. Authenticates users
3. Retrieves account balance
4. Completes the workflow

## 🔄 Workflow Execution

```javascript
// Example: Run a workflow
const result = await fetch('/api/workflows/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflow_id: 'workflow-uuid',
    input: {
      query: 'Check my balance',
      user_id: 'customer_123'
    }
  })
});
```

## 🛡️ Security

- Row Level Security (RLS) enabled on all tables
- Proper authentication and authorization
- Input validation and sanitization
- Error handling and logging

## 📊 Monitoring

- Real-time workflow execution tracking
- Comprehensive logging of all events
- Performance metrics and analytics
- Error tracking and debugging

## 🔧 Configuration

Environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
NODE_ENV=development
```

## 🧪 Testing

Run the test suite:
```bash
node scripts/test_workflow.js
```

The test script demonstrates:
- Agent creation and management
- Tool registration and execution
- Workflow setup and execution
- Log retrieval and analysis

## 📈 Scaling

AgentFlow is designed for scalability:
- Microservice-ready architecture
- Database-driven configuration
- Stateless workflow execution
- Horizontal scaling support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and support:
1. Check the troubleshooting section
2. Review the logs for error details
3. Ensure proper Supabase configuration
4. Verify database migrations are applied

---
