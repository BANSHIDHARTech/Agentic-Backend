import { supabase } from '../core/database.js';
import { ToolModel } from '../core/models.js';

export class ToolService {
  static async createTool(toolData) {
    const validatedData = ToolModel.validate(toolData);
    
    const { data, error } = await supabase
      .from('tools')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTool(id) {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getToolByName(name) {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('name', name)
      .single();

    if (error) throw error;
    return data;
  }

  static async getAllTools() {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateTool(id, toolData) {
    const validatedData = ToolModel.validate(toolData);
    
    const { data, error } = await supabase
      .from('tools')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTool(id) {
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  static async executeTool(toolId, parameters = {}) {
    const tool = await this.getTool(toolId);
    
    try {
      // Log tool execution start
      await supabase
        .from('logs')
        .insert({
          event_type: 'tool_execution_start',
          details: {
            tool_id: toolId,
            tool_name: tool.name,
            parameters,
            timestamp: new Date().toISOString()
          }
        });

      // Execute the tool function
      const result = await this.simulateToolExecution(tool, parameters);
      
      // Log tool execution success
      await supabase
        .from('logs')
        .insert({
          event_type: 'tool_execution_success',
          details: {
            tool_id: toolId,
            tool_name: tool.name,
            parameters,
            result,
            timestamp: new Date().toISOString()
          }
        });
      
      return result;
    } catch (error) {
      // Log tool execution error
      await supabase
        .from('logs')
        .insert({
          event_type: 'tool_execution_error',
          details: {
            tool_id: toolId,
            tool_name: tool.name,
            parameters,
            error: error.message,
            timestamp: new Date().toISOString()
          }
        });
      
      throw error;
    }
  }

  static async simulateToolExecution(tool, parameters) {
    // Simulate tool execution based on tool name
    const toolName = tool.name.toLowerCase();
    
    switch (toolName) {
      case 'get_postpaid_balance':
        return {
          customer_id: parameters.customer_id || parameters.user_id || 'unknown',
          balance: 85.50,
          currency: 'USD',
          last_updated: new Date().toISOString(),
          account_status: 'active',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
      
      case 'authenticate_user':
        return {
          user_id: parameters.user_id || 'user_123',
          authenticated: true,
          session_token: 'mock_token_' + Date.now(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          user_role: 'customer'
        };
      
      case 'send_notification':
        return {
          notification_id: 'notif_' + Date.now(),
          recipient: parameters.recipient || parameters.user_id,
          message: parameters.message || 'Notification sent',
          status: 'sent',
          sent_at: new Date().toISOString()
        };
      
      case 'create_ticket':
        return {
          ticket_id: 'ticket_' + Date.now(),
          customer_id: parameters.customer_id || parameters.user_id,
          subject: parameters.subject || 'Support Request',
          status: 'open',
          priority: parameters.priority || 'medium',
          created_at: new Date().toISOString()
        };
      
      default:
        // Generic tool execution
        return {
          tool_name: tool.name,
          executed: true,
          parameters,
          result: `Tool ${tool.name} executed successfully`,
          timestamp: new Date().toISOString()
        };
    }
  }

  static async registerBuiltinTools() {
    const builtinTools = [
      {
        name: 'get_postpaid_balance',
        description: 'Retrieves the postpaid balance for a customer account',
        function_code: 'function get_postpaid_balance(customer_id) { return { customer_id, balance: 85.50, currency: "USD" }; }',
        parameters: {
          customer_id: { type: 'string', required: true, description: 'Customer ID to retrieve balance for' }
        }
      },
      {
        name: 'authenticate_user',
        description: 'Authenticates user credentials and returns session information',
        function_code: 'function authenticate_user(user_id, password) { return { user_id, authenticated: true, session_token: "token_123" }; }',
        parameters: {
          user_id: { type: 'string', required: true, description: 'User ID to authenticate' },
          password: { type: 'string', required: false, description: 'User password (optional for demo)' }
        }
      },
      {
        name: 'send_notification',
        description: 'Sends a notification to a user',
        function_code: 'function send_notification(recipient, message) { return { notification_id: "notif_123", status: "sent" }; }',
        parameters: {
          recipient: { type: 'string', required: true, description: 'Recipient user ID' },
          message: { type: 'string', required: true, description: 'Notification message' }
        }
      }
    ];

    const results = [];
    for (const tool of builtinTools) {
      try {
        // Check if tool already exists
        const existing = await this.getToolByName(tool.name).catch(() => null);
        if (!existing) {
          const created = await this.createTool(tool);
          results.push(created);
        }
      } catch (error) {
        console.error(`Failed to register tool ${tool.name}:`, error.message);
      }
    }
    
    return results;
  }
}