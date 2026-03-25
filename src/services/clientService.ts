import { supabase } from '@/lib/supabase';
import { CRMClient, Communication, Contact } from '@/types/client';

export const clientService = {
  async getAllClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as CRMClient[];
  },

  async getClientById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*, cases:cases(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
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

  async getCommunications(clientId: string) {
    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Communication[];
  },

  async getContacts(clientId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;
    return data as Contact[];
  }
};
