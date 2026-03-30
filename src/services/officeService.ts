import { supabase } from '@/lib/supabase';

export const officeService = {
  async getAllOffices() {
    const { data, error } = await supabase
      .from('offices')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getFirmStaff(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('profiles')
      .select('*, office:offices(name)', { count: 'exact' })
      .order('name')
      .range(from, to);

    if (error) throw error;
    
    return {
      data: (data || []).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        officeId: u.office_id,
        department: u.department,
        status: u.status || 'Active'
      })),
      totalCount: count || 0
    };
  },

  async getRevenueMetrics(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('offices')
      .select('id, name, monthly_revenue, staff_count, active_cases_count, location, address, phone, status', { count: 'exact' })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(off => ({
        id: off.id,
        name: off.name,
        monthlyRevenue: off.monthly_revenue || 0,
        staffCount: off.staff_count || 0,
        activeCasesCount: off.active_cases_count || 0,
        location: off.location,
        address: off.address,
        phone: off.phone,
        status: off.status
      })),
      totalCount: count || 0
    };
  },

  async createStaffMember(staffData: {
    name: string;
    email: string;
    role: string;
    officeId: string;
    department: string;
  }) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: crypto.randomUUID(), // Mocking UUID for now, in real apps auth.signup handles this
        name: staffData.name,
        email: staffData.email,
        role: staffData.role,
        office_id: staffData.officeId,
        department: staffData.department,
        status: 'Active'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStaffByOffice(officeId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('office_id', officeId)
      .eq('status', 'Active')
      .order('name');

    if (error) throw error;
    return (data || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      officeId: u.office_id
    }));
  }
};
