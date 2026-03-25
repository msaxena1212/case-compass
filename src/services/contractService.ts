import { supabase } from '@/lib/supabase';
import { Contract, ContractApproval } from '@/types/contract';

export const contractService = {
  async getAllContracts(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('contracts')
      .select('*, client:clients(name)', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(c => ({
        id: c.id,
        title: c.title,
        type: c.type,
        status: c.status,
        parties: {
          partyA: c.party_a,
          partyB: c.party_b
        },
        caseId: c.case_id,
        clientId: c.client_id,
        riskScore: c.risk_score,
        clauses: c.clauses,
        approvals: c.approvals,
        value: c.value,
        startDate: c.start_date,
        expiryDate: c.expiry_date,
        signedDate: c.signed_date,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        version: c.version
      })) as Contract[],
      totalCount: count || 0
    };
  },

  async getContractById(id: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      title: data.title,
      type: data.type,
      status: data.status,
      parties: {
        partyA: data.party_a,
        partyB: data.party_b
      },
      caseId: data.case_id,
      clientId: data.client_id,
      riskScore: data.risk_score,
      clauses: data.clauses,
      approvals: data.approvals,
      value: data.value,
      startDate: data.start_date,
      expiryDate: data.expiry_date,
      signedDate: data.signed_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      version: data.version
    } as Contract;
  },

  async createContract(contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('contracts')
      .insert([{
        title: contractData.title,
        type: contractData.type,
        status: contractData.status,
        party_a: contractData.parties.partyA,
        party_b: contractData.parties.partyB,
        case_id: contractData.caseId,
        client_id: contractData.clientId,
        risk_score: contractData.riskScore,
        clauses: contractData.clauses,
        approvals: contractData.approvals,
        value: contractData.value,
        start_date: contractData.startDate,
        expiry_date: contractData.expiryDate,
        signed_date: contractData.signedDate,
        version: contractData.version
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateContract(id: string, updates: Partial<Contract>) {
    const dbUpdates: any = { ...updates };
    if (updates.parties) {
      if (updates.parties.partyA) dbUpdates.party_a = updates.parties.partyA;
      if (updates.parties.partyB) dbUpdates.party_b = updates.parties.partyB;
      delete dbUpdates.parties;
    }
    if (updates.caseId) { dbUpdates.case_id = updates.caseId; delete dbUpdates.caseId; }
    if (updates.clientId) { dbUpdates.client_id = updates.clientId; delete dbUpdates.clientId; }
    if (updates.riskScore) { dbUpdates.risk_score = updates.riskScore; delete dbUpdates.riskScore; }
    if (updates.startDate) { dbUpdates.start_date = updates.startDate; delete dbUpdates.startDate; }
    if (updates.expiryDate) { dbUpdates.expiry_date = updates.expiryDate; delete dbUpdates.expiryDate; }
    if (updates.signedDate) { dbUpdates.signed_date = updates.signedDate; delete dbUpdates.signedDate; }
    
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('contracts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
