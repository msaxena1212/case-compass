import { supabase } from '@/lib/supabase';

export interface CaseNote {
  id: string;
  caseId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const noteService = {
  async getNotesByCase(caseId: string) {
    const { data, error } = await supabase
      .from('case_notes')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((n: any) => ({
      id: n.id,
      caseId: n.case_id,
      content: n.content,
      createdBy: n.created_by || 'System',
      createdAt: n.created_at,
      updatedAt: n.updated_at || n.created_at,
    })) as CaseNote[];
  },

  async createNote(caseId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('case_notes')
      .insert([{
        case_id: caseId,
        content,
        created_by: user?.id || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      caseId: data.case_id,
      content: data.content,
      createdBy: data.created_by || 'System',
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at,
    } as CaseNote;
  },

  async updateNote(id: string, content: string) {
    const { data, error } = await supabase
      .from('case_notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteNote(id: string) {
    const { error } = await supabase
      .from('case_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
