import { supabase } from '@/lib/supabase';
import { AuditLog, SecurityEvent } from '@/types/security';

export const securityService = {
  async getAuditLogs(page: number = 1, pageSize: number = 10, query: string = '') {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let supabaseQuery = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(`action.ilike.%${query}%,resource.ilike.%${query}%,user_name.ilike.%${query}%`);
    }

    const { data, error, count } = await supabaseQuery
      .order('timestamp', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: data as AuditLog[],
      totalCount: count || 0
    };
  },

  async getSecurityEvents(page: number = 1, pageSize: number = 10, query: string = '') {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let supabaseQuery = supabase
      .from('security_events')
      .select('*', { count: 'exact' });

    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(`message.ilike.%${query}%,type.ilike.%${query}%`);
    }

    const { data, error, count } = await supabaseQuery
      .order('timestamp', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: data as SecurityEvent[],
      totalCount: count || 0
    };
  },

  async logAction(action: Omit<AuditLog, 'id' | 'timestamp'>) {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{ ...action, timestamp: new Date().toISOString() }]);

    if (error) console.error('Failed to log audit action:', error.message);
  },

  async resolveSecurityEvent(id: string, resolvedBy: string) {
    const { data, error } = await supabase
      .from('security_events')
      .update({ 
        resolved: true, 
        resolved_at: new Date().toISOString(), 
        resolved_by: resolvedBy 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SecurityEvent;
  },

  async getRolePermissions() {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*');

    if (error) throw error;
    return data;
  }
};
