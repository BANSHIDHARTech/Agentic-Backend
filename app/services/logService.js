import { supabase } from '../core/database.js';

export class LogService {
  static async getLogs(filters = {}) {
    let query = supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }

    if (filters.workflow_run_id) {
      query = query.eq('workflow_run_id', filters.workflow_run_id);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async createLog(eventType, details, workflowRunId = null) {
    const { data, error } = await supabase
      .from('logs')
      .insert({
        event_type: eventType,
        details,
        workflow_run_id: workflowRunId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getWorkflowRunLogs(workflowRunId) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('workflow_run_id', workflowRunId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getLogsByEventType(eventType, limit = 100) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async deleteOldLogs(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;
    return true;
  }

  static async getLogStats() {
    const { data, error } = await supabase
      .from('logs')
      .select('event_type')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const stats = {};
    data.forEach(log => {
      stats[log.event_type] = (stats[log.event_type] || 0) + 1;
    });

    return stats;
  }
}