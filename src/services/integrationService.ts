import { supabase } from '@/lib/supabase';
import { Integration, ApiSyncLog } from '@/types/integration';

export const integrationService = {
  async getIntegrations() {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .order('provider', { ascending: true });

    if (error) throw error;
    return data as Integration[];
  },

  async toggleIntegration(id: string, status: string) {
    const { data, error } = await supabase
      .from('integrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Integration;
  },

  async getSyncLogs() {
    const { data, error } = await supabase
      .from('api_sync_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as ApiSyncLog[];
  },

  async logSyncEvent(log: Omit<ApiSyncLog, 'id' | 'timestamp'>) {
    const { data, error } = await supabase
      .from('api_sync_logs')
      .insert([log])
      .select()
      .single();

    if (error) throw error;
    return data as ApiSyncLog;
  }
};
