import { supabase } from '../core/database.js';
import { AgentModel } from '../core/models.js';

export class AgentService {
  static async createAgent(agentData) {
    const validatedData = AgentModel.validate(agentData);
    
    const { data, error } = await supabase
      .from('agents')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateAgent(id, agentData) {
    const validatedData = AgentModel.validate(agentData);
    
    const { data, error } = await supabase
      .from('agents')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAgent(id) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getAgentByName(name) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('name', name)
      .single();

    if (error) throw error;
    return data;
  }

  static async getAllAgents() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async deleteAgent(id) {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  static async findAgentByIntent(intent) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .contains('input_intents', [intent])
      .eq('is_active', true);

    if (error) throw error;
    return data;
  }

  static async executeAgent(agent, input) {
    try {
      // Log agent execution start
      await supabase
        .from('logs')
        .insert({
          event_type: 'agent_execution_start',
          details: {
            agent_id: agent.id,
            agent_name: agent.name,
            input,
            timestamp: new Date().toISOString()
          }
        });

      let result;
      
      if (agent.tool_id) {
        // Execute tool if agent has one
        const { ToolService } = await import('./toolService.js');
        const toolResult = await ToolService.executeTool(agent.tool_id, input);
        result = {
          output: toolResult,
          output_intent: this.determineOutputIntent(agent, toolResult)
        };
      } else {
        // Simulate LLM processing
        result = await this.simulateLLMProcessing(agent, input);
      }

      // Log agent execution completion
      await supabase
        .from('logs')
        .insert({
          event_type: 'agent_execution_complete',
          details: {
            agent_id: agent.id,
            agent_name: agent.name,
            input,
            output: result.output,
            output_intent: result.output_intent,
            timestamp: new Date().toISOString()
          }
        });

      return result;
    } catch (error) {
      // Log agent execution error
      await supabase
        .from('logs')
        .insert({
          event_type: 'agent_execution_error',
          details: {
            agent_id: agent.id,
            agent_name: agent.name,
            input,
            error: error.message,
            timestamp: new Date().toISOString()
          }
        });

      throw error;
    }
  }

  static async simulateLLMProcessing(agent, input) {
    // Simulate LLM processing based on agent type and system prompt
    const agentName = agent.name.toLowerCase();
    
    switch (agentName) {
      case 'routeragent':
        return {
          output: { 
            message: 'Routing request to authentication',
            user_query: input.query || input.message || 'User request',
            routing_decision: 'authenticate_user'
          },
          output_intent: 'need_authentication'
        };
      
      case 'authagent':
        return {
          output: { 
            message: 'User authenticated successfully', 
            user_id: input.user_id || 'user_123',
            authenticated: true,
            session_token: 'session_' + Date.now()
          },
          output_intent: 'need_balance_info'
        };
      
      case 'postpaidbalanceagent':
        return {
          output: { 
            message: 'Balance retrieved successfully',
            customer_id: input.user_id || input.customer_id || 'user_123',
            balance: 85.50,
            currency: 'USD',
            last_updated: new Date().toISOString()
          },
          output_intent: 'workflow_complete'
        };
      
      case 'stopagent':
        return {
          output: { 
            message: 'Workflow completed successfully',
            final_result: input,
            completed_at: new Date().toISOString()
          },
          output_intent: 'workflow_end'
        };
      
      default:
        // Generic agent processing
        return {
          output: { 
            message: `Agent ${agent.name} processed request`,
            processed_data: input,
            agent_response: `Processed by ${agent.name} using prompt: ${agent.system_prompt.substring(0, 100)}...`
          },
          output_intent: agent.output_intents[0] || 'workflow_complete'
        };
    }
  }

  static determineOutputIntent(agent, toolResult) {
    // Determine output intent based on tool result and agent configuration
    if (toolResult.authenticated) {
      return 'need_balance_info';
    }
    if (toolResult.balance !== undefined) {
      return 'workflow_complete';
    }
    if (toolResult.error) {
      return 'workflow_error';
    }
    
    // Default to first output intent
    return agent.output_intents[0] || 'workflow_complete';
  }
}