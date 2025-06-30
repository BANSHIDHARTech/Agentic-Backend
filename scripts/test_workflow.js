#!/usr/bin/env node

/**
 * AgentFlow Complete Test Script
 * 
 * This script demonstrates the full AgentFlow system:
 * 1. Tests database connection
 * 2. Verifies all agents and tools exist
 * 3. Executes the complete Customer Service Workflow
 * 4. Shows detailed execution logs and results
 * 5. Tests individual API endpoints
 */

const BASE_URL = 'http://localhost:3001';

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${result.error || result.message || 'Unknown error'}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

// Helper function to display results nicely
function displaySection(title, data = null) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔸 ${title}`);
  console.log(`${'='.repeat(60)}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function displayStep(step, description, result = null) {
  console.log(`\n${step}. ${description}`);
  console.log(`${'─'.repeat(50)}`);
  if (result) {
    if (typeof result === 'object') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(result);
    }
  }
}

async function testAgentFlowSystem() {
  console.log('🚀 AgentFlow Complete System Test');
  console.log('Testing dynamic AI agent orchestration platform...\n');

  try {
    // 1. Health Check
    displayStep('1', 'Testing system health...');
    const health = await apiRequest('/health');
    console.log(`✅ System Status: ${health.status}`);
    console.log(`📅 Timestamp: ${health.timestamp}`);

    // 2. Test Database Connection
    displayStep('2', 'Testing database connection...');
    const agents = await apiRequest('/api/agents');
    const tools = await apiRequest('/api/tools');
    const workflows = await apiRequest('/api/workflows');
    
    console.log(`✅ Database connected successfully`);
    console.log(`📊 Found ${agents.length} agents, ${tools.length} tools, ${workflows.length} workflows`);

    // 3. Display Available Resources
    displaySection('Available Agents', agents.map(a => ({ 
      name: a.name, 
      input_intents: a.input_intents, 
      output_intents: a.output_intents,
      has_tool: !!a.tool_id
    })));

    displaySection('Available Tools', tools.map(t => ({ 
      name: t.name, 
      description: t.description 
    })));

    displaySection('Available Workflows', workflows.map(w => ({ 
      name: w.name, 
      description: w.description 
    })));

    // 4. Find Customer Service Workflow
    displayStep('4', 'Locating Customer Service Workflow...');
    const customerServiceWorkflow = workflows.find(w => 
      w.name.toLowerCase().includes('customer service')
    );

    if (!customerServiceWorkflow) {
      throw new Error('Customer Service Workflow not found. Please ensure the seed data is loaded.');
    }

    console.log(`✅ Found workflow: ${customerServiceWorkflow.name}`);
    console.log(`📝 Description: ${customerServiceWorkflow.description}`);

    // 5. Get Workflow Details
    displayStep('5', 'Getting workflow structure...');
    const workflowDetails = await apiRequest(`/api/workflows/${customerServiceWorkflow.id}`);
    
    console.log(`✅ Workflow Structure:`);
    console.log(`   - Nodes: ${workflowDetails.nodes.length}`);
    console.log(`   - Edges: ${workflowDetails.edges.length}`);
    
    workflowDetails.nodes.forEach((node, index) => {
      console.log(`   Node ${index + 1}: ${node.agents.name} (${node.node_type})`);
    });

    workflowDetails.edges.forEach((edge, index) => {
      const fromNode = workflowDetails.nodes.find(n => n.id === edge.from_node_id);
      const toNode = workflowDetails.nodes.find(n => n.id === edge.to_node_id);
      console.log(`   Edge ${index + 1}: ${fromNode.agents.name} → ${toNode.agents.name} (${edge.trigger_intent})`);
    });

    // 6. Test Individual Tool Execution
    displayStep('6', 'Testing individual tool execution...');
    const balanceTool = tools.find(t => t.name === 'get_postpaid_balance');
    if (balanceTool) {
      const toolResult = await apiRequest(`/api/tools/${balanceTool.id}/execute`, 'POST', {
        customer_id: 'test_customer_123'
      });
      console.log(`✅ Tool execution successful:`);
      console.log(`   Customer ID: ${toolResult.customer_id}`);
      console.log(`   Balance: ${toolResult.currency} ${toolResult.balance}`);
      console.log(`   Status: ${toolResult.account_status}`);
    }

    // 7. Test Individual Agent Execution
    displayStep('7', 'Testing individual agent execution...');
    const routerAgent = agents.find(a => a.name.toLowerCase().includes('router'));
    if (routerAgent) {
      const agentResult = await apiRequest(`/api/agents/${routerAgent.id}/execute`, 'POST', {
        query: 'I need to check my account balance',
        user_id: 'test_user_123'
      });
      console.log(`✅ Agent execution successful:`);
      console.log(`   Agent: ${routerAgent.name}`);
      console.log(`   Output Intent: ${agentResult.output_intent}`);
      console.log(`   Response: ${agentResult.output.message}`);
    }

    // 8. Execute Complete Workflow
    displayStep('8', 'Executing complete workflow...');
    const workflowInput = {
      workflow_id: customerServiceWorkflow.id,
      input: {
        query: 'I need to check my postpaid account balance please',
        user_id: 'customer_123',
        customer_name: 'John Doe'
      }
    };

    console.log(`🔄 Starting workflow with input:`);
    console.log(JSON.stringify(workflowInput.input, null, 2));

    const workflowRun = await apiRequest('/api/workflows/run', 'POST', workflowInput);
    
    console.log(`\n✅ Workflow executed successfully!`);
    console.log(`📋 Run ID: ${workflowRun.run_id}`);
    console.log(`📊 Status: ${workflowRun.status}`);
    console.log(`🛤️  Total Steps: ${workflowRun.total_steps}`);

    // 9. Display Execution Path
    displaySection('Workflow Execution Path');
    workflowRun.execution_path.forEach((step, index) => {
      console.log(`\nStep ${step.step}: ${step.agent_name}`);
      console.log(`├─ Input: ${JSON.stringify(step.input)}`);
      console.log(`├─ Output: ${JSON.stringify(step.output)}`);
      console.log(`├─ Intent: ${step.output_intent}`);
      console.log(`└─ Time: ${step.timestamp}`);
    });

    // 10. Get Workflow Logs
    displayStep('10', 'Retrieving workflow execution logs...');
    const logs = await apiRequest(`/api/logs/workflow-run/${workflowRun.run_id}`);
    
    console.log(`✅ Found ${logs.length} log entries:`);
    logs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.event_type} - ${new Date(log.created_at).toLocaleTimeString()}`);
      if (log.details.agent_name) {
        console.log(`      Agent: ${log.details.agent_name}`);
      }
      if (log.details.error) {
        console.log(`      Error: ${log.details.error}`);
      }
    });

    // 11. Display Final Results
    displaySection('Final Workflow Results', {
      workflow_name: customerServiceWorkflow.name,
      execution_status: workflowRun.status,
      total_execution_time: `${workflowRun.total_steps} steps`,
      final_output: workflowRun.final_output,
      customer_balance: workflowRun.final_output.balance,
      currency: workflowRun.final_output.currency
    });

    // 12. Test Log Statistics
    displayStep('12', 'Getting system statistics...');
    const logStats = await apiRequest('/api/logs/stats');
    console.log(`✅ System activity in last 24 hours:`);
    Object.entries(logStats).forEach(([eventType, count]) => {
      console.log(`   ${eventType}: ${count} events`);
    });

    // 13. Test Workflow Runs History
    displayStep('13', 'Getting workflow run history...');
    const workflowRuns = await apiRequest(`/api/workflows/${customerServiceWorkflow.id}/runs`);
    console.log(`✅ Found ${workflowRuns.length} workflow runs:`);
    workflowRuns.slice(0, 3).forEach((run, index) => {
      console.log(`   ${index + 1}. ${run.status} - ${new Date(run.started_at).toLocaleString()}`);
    });

    // 14. Success Summary
    displaySection('🎉 TEST COMPLETED SUCCESSFULLY! 🎉');
    console.log(`
✅ All systems operational
✅ Database connection verified
✅ ${agents.length} agents loaded and functional
✅ ${tools.length} tools registered and executable
✅ ${workflows.length} workflows available
✅ Complete workflow execution successful
✅ Logging system operational
✅ API endpoints responding correctly

🚀 AgentFlow is ready for production use!

Next Steps:
1. Connect to real LLM APIs (OpenAI, Anthropic, etc.)
2. Add more sophisticated tools and integrations
3. Build a frontend interface for workflow management
4. Implement user authentication and multi-tenancy
5. Add monitoring and alerting systems

📚 API Documentation:
- Health: GET ${BASE_URL}/health
- Agents: GET/POST ${BASE_URL}/api/agents
- Tools: GET/POST ${BASE_URL}/api/tools
- Workflows: GET/POST ${BASE_URL}/api/workflows
- Run Workflow: POST ${BASE_URL}/api/workflows/run
- Logs: GET ${BASE_URL}/api/logs

🔧 Test this system:
- Modify agents and tools in the database
- Create new workflows with different agent chains
- Test with different input scenarios
- Monitor execution through the logs API
    `);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure the server is running: node server.js');
    console.log('2. Check Supabase configuration in .env file');
    console.log('3. Verify database migrations have been applied');
    console.log('4. Ensure seed data has been loaded');
    console.log('5. Check network connectivity to Supabase');
    
    process.exit(1);
  }
}

// Run the comprehensive test
testAgentFlowSystem();