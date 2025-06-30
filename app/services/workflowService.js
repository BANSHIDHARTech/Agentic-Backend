import { supabase } from '../core/database.js';
import { WorkflowModel, WorkflowRunModel } from '../core/models.js';
import { AgentService } from './agentService.js';

export class WorkflowService {
  static async createWorkflow(workflowData) {
    const validatedData = WorkflowModel.validate(workflowData);
    
    // Create workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        is_active: validatedData.is_active
      })
      .select()
      .single();

    if (workflowError) throw workflowError;

    // Create workflow nodes
    const nodes = validatedData.nodes.map(node => ({
      workflow_id: workflow.id,
      agent_id: node.agent_id,
      node_type: node.node_type || 'agent',
      position: node.position || { x: 0, y: 0 }
    }));

    const { data: createdNodes, error: nodesError } = await supabase
      .from('workflow_nodes')
      .insert(nodes)
      .select();

    if (nodesError) throw nodesError;

    // Create workflow edges
    const edges = validatedData.edges.map(edge => ({
      workflow_id: workflow.id,
      from_node_id: edge.from_node_id,
      to_node_id: edge.to_node_id,
      trigger_intent: edge.trigger_intent,
      condition: edge.condition || null
    }));

    const { data: createdEdges, error: edgesError } = await supabase
      .from('workflow_edges')
      .insert(edges)
      .select();

    if (edgesError) throw edgesError;

    return {
      ...workflow,
      nodes: createdNodes,
      edges: createdEdges
    };
  }

  static async getWorkflow(id) {
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (workflowError) throw workflowError;

    const { data: nodes, error: nodesError } = await supabase
      .from('workflow_nodes')
      .select('*, agents(*)')
      .eq('workflow_id', id);

    if (nodesError) throw nodesError;

    const { data: edges, error: edgesError } = await supabase
      .from('workflow_edges')
      .select('*')
      .eq('workflow_id', id);

    if (edgesError) throw edgesError;

    return {
      ...workflow,
      nodes,
      edges
    };
  }

  static async getAllWorkflows() {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async runWorkflow(workflowId, initialInput = {}) {
    const workflow = await this.getWorkflow(workflowId);
    
    // Create workflow run
    const { data: run, error: runError } = await supabase
      .from('workflow_runs')
      .insert({
        workflow_id: workflowId,
        status: 'running',
        input_data: initialInput,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (runError) throw runError;

    try {
      // Log workflow start
      await supabase
        .from('logs')
        .insert({
          event_type: 'workflow_start',
          workflow_run_id: run.id,
          details: {
            workflow_id: workflowId,
            workflow_name: workflow.name,
            input_data: initialInput,
            timestamp: new Date().toISOString()
          }
        });

      // Find the starting node (router agent or start node)
      const startNode = workflow.nodes.find(node => 
        node.agents.name.toLowerCase().includes('router') || 
        node.node_type === 'start' ||
        node.agents.name.toLowerCase() === 'routeragent'
      );

      if (!startNode) {
        throw new Error('No starting node found in workflow');
      }

      let currentNode = startNode;
      let currentInput = initialInput;
      const executionPath = [];
      let stepCount = 0;
      const maxSteps = 10; // Prevent infinite loops

      while (currentNode && stepCount < maxSteps) {
        stepCount++;
        
        // Check if we've reached a stop condition
        if (currentNode.agents.name.toLowerCase().includes('stop') || 
            currentNode.node_type === 'end') {
          break;
        }

        // Execute current agent
        const stepResult = await AgentService.executeAgent(currentNode.agents, currentInput);

        executionPath.push({
          step: stepCount,
          node_id: currentNode.id,
          agent_id: currentNode.agents.id,
          agent_name: currentNode.agents.name,
          input: currentInput,
          output: stepResult.output,
          output_intent: stepResult.output_intent,
          timestamp: new Date().toISOString()
        });

        // Log workflow step
        await supabase
          .from('logs')
          .insert({
            event_type: 'workflow_step',
            workflow_run_id: run.id,
            details: {
              step: stepCount,
              agent_name: currentNode.agents.name,
              input: currentInput,
              output: stepResult.output,
              output_intent: stepResult.output_intent,
              timestamp: new Date().toISOString()
            }
          });

        // Check for workflow completion
        if (stepResult.output_intent === 'workflow_complete' || 
            stepResult.output_intent === 'workflow_end') {
          break;
        }

        // Find next node based on output intent
        const nextEdge = workflow.edges.find(edge => 
          edge.from_node_id === currentNode.id && 
          edge.trigger_intent === stepResult.output_intent
        );

        if (!nextEdge) {
          console.log(`No next edge found for intent: ${stepResult.output_intent}`);
          break;
        }

        currentNode = workflow.nodes.find(node => node.id === nextEdge.to_node_id);
        currentInput = stepResult.output;
      }

      const finalOutput = executionPath[executionPath.length - 1]?.output || {};

      // Update workflow run status
      await supabase
        .from('workflow_runs')
        .update({
          status: 'completed',
          output_data: finalOutput,
          execution_path: executionPath,
          completed_at: new Date().toISOString()
        })
        .eq('id', run.id);

      // Log workflow completion
      await supabase
        .from('logs')
        .insert({
          event_type: 'workflow_complete',
          workflow_run_id: run.id,
          details: {
            workflow_id: workflowId,
            execution_path: executionPath,
            final_output: finalOutput,
            total_steps: stepCount,
            timestamp: new Date().toISOString()
          }
        });

      return {
        run_id: run.id,
        status: 'completed',
        execution_path: executionPath,
        final_output: finalOutput,
        total_steps: stepCount
      };

    } catch (error) {
      // Update workflow run status to failed
      await supabase
        .from('workflow_runs')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', run.id);

      // Log workflow error
      await supabase
        .from('logs')
        .insert({
          event_type: 'workflow_error',
          workflow_run_id: run.id,
          details: {
            workflow_id: workflowId,
            error: error.message,
            timestamp: new Date().toISOString()
          }
        });

      throw error;
    }
  }

  static async executeWorkflowStep(runId, nodeId, input) {
    // Get the workflow run
    const { data: run, error: runError } = await supabase
      .from('workflow_runs')
      .select('*, workflows(*)')
      .eq('id', runId)
      .single();

    if (runError) throw runError;

    // Get the specific node
    const { data: node, error: nodeError } = await supabase
      .from('workflow_nodes')
      .select('*, agents(*)')
      .eq('id', nodeId)
      .single();

    if (nodeError) throw nodeError;

    // Execute the agent
    const result = await AgentService.executeAgent(node.agents, input);

    // Log the step execution
    await supabase
      .from('logs')
      .insert({
        event_type: 'workflow_step_manual',
        workflow_run_id: runId,
        details: {
          node_id: nodeId,
          agent_name: node.agents.name,
          input,
          output: result.output,
          output_intent: result.output_intent,
          timestamp: new Date().toISOString()
        }
      });

    return {
      node_id: nodeId,
      agent_name: node.agents.name,
      input,
      output: result.output,
      output_intent: result.output_intent
    };
  }

  static async getWorkflowRuns(workflowId) {
    const { data, error } = await supabase
      .from('workflow_runs')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getWorkflowRun(runId) {
    const { data, error } = await supabase
      .from('workflow_runs')
      .select('*, workflows(*)')
      .eq('id', runId)
      .single();

    if (error) throw error;
    return data;
  }
}