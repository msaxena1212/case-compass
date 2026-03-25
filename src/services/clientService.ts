import { supabase } from '@/lib/supabase';
import { CRMClient, Communication, Contact } from '@/types/client';

export const clientService = {
  async getAllClients(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: data as CRMClient[],
      totalCount: count || 0
    };
  },

  async getClientById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*, cases:cases(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      type: data.type,
      status: data.status,
      notes: data.notes,
      tags: data.tags || [],
      since: data.created_at ? new Date(data.created_at).getFullYear().toString() : new Date().getFullYear().toString(),
      avatar: data.name ? data.name.split(' ').map((n: any) => n[0]).join('') : '??',
      avatarUrl: data.avatar_url,
      linkedCaseIds: (data.cases || []).map((c: any) => c.id),
      healthScore: data.health_score,
      totalBilled: data.total_billed,
      outstandingAmount: data.outstanding_amount,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      cases: (data.cases || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        status: c.status,
        caseNumber: c.case_number,
        filingDate: c.filing_date,
        healthScore: c.health_score
      }))
    } as CRMClient;
  },

  async createClient(clientData: Omit<CRMClient, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (error) throw error;
    return data as CRMClient;
  },

  async updateClient(id: string, updates: Partial<CRMClient>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CRMClient;
  },

  async getCommunications(clientId: string, page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('communications')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(c => ({
        id: c.id,
        clientId: c.client_id,
        caseId: c.case_id,
        type: c.type,
        date: c.date,
        summary: c.summary,
        notes: c.notes,
        followUpDate: c.follow_up_date,
        loggedBy: c.logged_by
      })) as Communication[],
      totalCount: count || 0
    };
  },

  async getContacts(clientId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;
    return (data || []).map(c => ({
      id: c.id,
      clientId: c.client_id,
      name: c.name,
      role: c.role,
      phone: c.phone,
      email: c.email,
      linkedCaseId: c.linked_case_id
    })) as Contact[];
  }
};
