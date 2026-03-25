import { supabase } from '@/lib/supabase';
import { AuditLog, SecurityEvent } from '@/types/security';

export const securityService = {
  async getAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data as AuditLog[];
  },

  async getSecurityEvents() {
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data as SecurityEvent[];
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
  }
};
