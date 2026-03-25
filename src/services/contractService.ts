import { supabase } from '@/lib/supabase';
import { Contract, ContractApproval } from '@/types/contract';

export const contractService = {
  async getAllContracts() {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, client:clients(name)')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Contract[];
  },

  async getContractById(id: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Contract;
  },

  async createContract(contractData: Omit<Contract, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('contracts')
      .insert([contractData])
      .select()
      .single();

    if (error) throw error;
    return data as Contract;
  },

  async updateContract(id: string, updates: Partial<Contract>) {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Contract;
  },

  async approveContract(approvalData: Omit<ContractApproval, 'id'>) {
    const { data, error } = await supabase
      .from('contract_approvals')
      .insert([approvalData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
