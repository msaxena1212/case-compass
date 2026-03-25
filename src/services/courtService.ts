import { supabase } from '@/lib/supabase';
import { Hearing } from '@/types/hearing';
import { communicationService } from './communicationService';

export const courtService = {
  async getAllHearings(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('hearings')
      .select('*, case:cases(title)', { count: 'exact' })
      .order('date', { ascending: true })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(h => ({
        ...h,
        caseTitle: h.case?.title
      })) as Hearing[],
      totalCount: count || 0
    };
  },

  async getHearingsByCase(caseId: string, page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('hearings')
      .select('*', { count: 'exact' })
      .eq('case_id', caseId)
      .order('date', { ascending: true })
      .range(from, to);

    if (error) throw error;
    return {
      data: data as Hearing[],
      totalCount: count || 0
    };
  },

  async createHearing(hearing: Omit<Hearing, 'id'>) {
    const { data, error } = await supabase
      .from('hearings')
      .insert([hearing])
      .select()
      .single();

    if (error) throw error;

    try {
      const lawyers = await supabase.from('profiles').select('id').limit(1);
      const lawyer_id = lawyers.data?.[0]?.id;

      if (lawyer_id) {
        await communicationService.createNotification({
          userId: lawyer_id,
          title: 'New Hearing Scheduled',
          message: `A new hearing "${hearing.title}" has been scheduled for ${new Date(hearing.date).toLocaleDateString()}.`,
          type: 'Hearing',
          channel: 'In-App',
          actionUrl: '/calendar',
          metadata: {
            hearingId: data.id,
            caseId: hearing.caseId
          }
        });
      }
    } catch (notifyError) {
      console.error('Failed to create notification for hearing:', notifyError);
    }

    return data as Hearing;
  },

  async checkHearingClash(date: string) {
    const { data, error } = await supabase
      .from('hearings')
      .select('id')
      .gte('date', new Date(new Date(date).getTime() - 60 * 60 * 1000).toISOString())
      .lte('date', new Date(new Date(date).getTime() + 60 * 60 * 1000).toISOString())
      .limit(1);

    if (error) throw error;
    return (data || []).length > 0;
  },

  async updateHearing(id: string, updates: Partial<Hearing>) {
    const { data, error } = await supabase
      .from('hearings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Hearing;
  }
};
