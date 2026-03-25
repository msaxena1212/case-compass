import { supabase } from '@/lib/supabase';
import { AppNotification, CommunicationLog } from '@/types/communication';

export const communicationService = {
  async getNotifications(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { 
      data: data as AppNotification[],
      totalCount: count || 0
    };
  },

  async createNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'status'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: false,
        link: notification.actionUrl
      }])
      .select()
      .single();

    if (error) throw error;
    return data as AppNotification;
  },

  async markNotificationRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AppNotification;
  },

  async getCommunicationLogs(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('communications')
      .select('*, client:clients(name)', { count: 'exact' })
      .order('date', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(log => ({
        ...log,
        receiver: log.client?.name || 'Unknown Client',
        timestamp: log.date // Mapping date to timestamp for the UI
      })) as (CommunicationLog & { receiver: string })[],
      totalCount: count || 0
    };
  },

  async logCommunication(log: Omit<CommunicationLog, 'id' | 'timestamp'>) {
    const { data, error } = await supabase
      .from('communications')
      .insert([{
        client_id: log.clientId,
        case_id: log.caseId,
        type: log.type,
        summary: log.summary,
        notes: log.notes || log.content,
        date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
