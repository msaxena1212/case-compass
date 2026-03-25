import { supabase } from '@/lib/supabase';
import { Case, TimelineEntry } from '@/types/case';

export const caseService = {
  async getAllCases() {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Case[];
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
