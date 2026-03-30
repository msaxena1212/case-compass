import { supabase } from '@/lib/supabase';
import { Case, TimelineEntry, AppCase } from '@/types/case';

export const caseService = {
  async getAllCases(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('cases')
      .select('*, profiles(name), offices(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(c => ({
        id: c.id,
        title: c.title,
        type: c.type,
        status: c.status,
        court: c.court,
        caseNumber: c.case_number,
        filingDate: c.filing_date,
        lawyerId: c.lawyer_id,
        clientId: c.client_id,
        officeId: c.office_id,
        opponent: c.opponent,
        tags: c.tags || [],
        healthScore: c.health_score,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        lawyerName: (c as any).profiles?.name || 'Unassigned',
        officeName: (c as any).offices?.name || 'Main Office'
      })) as AppCase[],
      totalCount: count || 0
    };
  },

  async getCaseById(id: string) {
    const { data, error } = await supabase
      .from('cases')
      .select('*, client:clients(*), lawyer:profiles(*), office:offices(*)')
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
  },

  async transferCase(caseId: string, lawyerId: string, officeId: string) {
    const { data, error } = await supabase
      .from('cases')
      .update({ 
        lawyer_id: lawyerId, 
        office_id: officeId,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
