import { supabase } from '@/lib/supabase';
import { Case, TimelineEntry, AppCase } from '@/types/case';

export const caseService = {
  async getAllCases(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('cases')
      .select('*, profiles(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(c => ({
        ...c,
        lawyerName: (c as any).profiles?.name || 'Unassigned'
      })) as AppCase[],
      totalCount: count || 0
    };
  },

  async getCaseById(id: string) {
    const { data, error } = await supabase
      .from('cases')
      .select('*, client:clients(*), lawyer:profiles(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createCase(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('cases')
      .insert([caseData])
      .select()
      .single();

    if (error) throw error;
    return data as Case;
  },

  async updateCase(id: string, updates: Partial<Case>) {
    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Case;
  },

  async getTimeline(caseId: string) {
    const { data, error } = await supabase
      .from('timeline_entries') // Assuming a table for timeline
      .select('*')
      .eq('case_id', caseId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as TimelineEntry[];
  }
};
