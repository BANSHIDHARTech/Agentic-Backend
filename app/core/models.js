// Data models and validation schemas
export const AgentModel = {
  validate: (data) => {
    const required = ['name', 'system_prompt', 'model_name'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return {
      name: data.name,
      description: data.description || '',
      system_prompt: data.system_prompt,
      model_name: data.model_name,
      input_intents: data.input_intents || [],
      output_intents: data.output_intents || [],
      tool_id: data.tool_id || null,
      is_active: data.is_active !== false
    };
  }
};

export const ToolModel = {
  validate: (data) => {
    const required = ['name', 'function_code'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return {
      name: data.name,
      description: data.description || '',
      function_code: data.function_code,
      parameters: data.parameters || {},
      is_active: data.is_active !== false
    };
  }
};

export const WorkflowModel = {
  validate: (data) => {
    const required = ['name', 'nodes', 'edges'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      throw new Error('Nodes and edges must be arrays');
    }

    return {
      name: data.name,
      description: data.description || '',
      nodes: data.nodes,
      edges: data.edges,
      is_active: data.is_active !== false
    };
  }
};

export const WorkflowRunModel = {
  validate: (data) => {
    const required = ['workflow_id'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return {
      workflow_id: data.workflow_id,
      input_data: data.input_data || {},
      status: data.status || 'pending'
    };
  }
};