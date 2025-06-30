// Built-in tool definitions for AgentFlow
export const builtinTools = {
  get_postpaid_balance: {
    name: 'get_postpaid_balance',
    description: 'Retrieves the postpaid balance for a customer account',
    parameters: {
      customer_id: { type: 'string', required: true, description: 'Customer ID to retrieve balance for' }
    },
    execute: (params) => {
      return {
        customer_id: params.customer_id,
        balance: 85.50,
        currency: 'USD',
        last_updated: new Date().toISOString(),
        account_status: 'active',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    }
  },

  authenticate_user: {
    name: 'authenticate_user',
    description: 'Authenticates user credentials and returns session information',
    parameters: {
      user_id: { type: 'string', required: true, description: 'User ID to authenticate' },
      password: { type: 'string', required: false, description: 'User password (optional for demo)' }
    },
    execute: (params) => {
      return {
        user_id: params.user_id,
        authenticated: true,
        session_token: 'mock_token_' + Date.now(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        user_role: 'customer'
      };
    }
  },

  send_notification: {
    name: 'send_notification',
    description: 'Sends a notification to a user',
    parameters: {
      recipient: { type: 'string', required: true, description: 'Recipient user ID' },
      message: { type: 'string', required: true, description: 'Notification message' }
    },
    execute: (params) => {
      return {
        notification_id: 'notif_' + Date.now(),
        recipient: params.recipient,
        message: params.message,
        status: 'sent',
        sent_at: new Date().toISOString()
      };
    }
  },

  create_ticket: {
    name: 'create_ticket',
    description: 'Creates a support ticket',
    parameters: {
      customer_id: { type: 'string', required: true, description: 'Customer ID' },
      subject: { type: 'string', required: true, description: 'Ticket subject' },
      priority: { type: 'string', required: false, description: 'Ticket priority (low, medium, high)' }
    },
    execute: (params) => {
      return {
        ticket_id: 'ticket_' + Date.now(),
        customer_id: params.customer_id,
        subject: params.subject,
        status: 'open',
        priority: params.priority || 'medium',
        created_at: new Date().toISOString()
      };
    }
  }
};

// Function to register all builtin tools
export const registerBuiltinTools = async () => {
  const { ToolService } = await import('../services/toolService.js');
  
  const results = [];
  for (const [name, tool] of Object.entries(builtinTools)) {
    try {
      const existing = await ToolService.getToolByName(name).catch(() => null);
      if (!existing) {
        const created = await ToolService.createTool({
          name: tool.name,
          description: tool.description,
          function_code: `function ${tool.name}(params) { return ${JSON.stringify(tool.execute({}), null, 2)}; }`,
          parameters: tool.parameters
        });
        results.push(created);
      }
    } catch (error) {
      console.error(`Failed to register tool ${name}:`, error.message);
    }
  }
  
  return results;
};