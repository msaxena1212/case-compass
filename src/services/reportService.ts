import { supabase } from '@/lib/supabase';
import { ReportFilters } from '@/types/report';

export const reportService = {
  async getAuditLogs(filters: ReportFilters = {}) {
    let query = supabase.from('audit_logs').select('*');
    
    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }
    
    const { data, error } = await query.order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getRevenueStats(filters: ReportFilters = {}) {
    let query = supabase.from('billing_invoices').select('total, issued_date, status');
    
    if (filters.startDate) {
      query = query.gte('issued_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('issued_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getCaseStats() {
    const { data, error } = await supabase
      .from('cases')
      .select('type, status, filing_date');
    
    if (error) throw error;
    return data;
  },

  async getFirmPerformance() {
    // Aggregated stats for the analytics dashboard
    const [cases, billing, clients] = await Promise.all([
      supabase.from('cases').select('count', { count: 'exact', head: true }),
      supabase.from('billing_invoices').select('total'),
      supabase.from('clients').select('count', { count: 'exact', head: true })
    ]);

    const totalRevenue = (billing.data || []).reduce((sum, inv) => sum + (inv.total || 0), 0);

    return {
      totalCases: cases.count || 0,
      totalRevenue,
      totalClients: clients.count || 0,
      averageCaseValue: totalRevenue / (cases.count || 1)
    };
  },

  async getRevenueTrend() {
    const { data, error } = await supabase
      .from('billing_invoices')
      .select('total, issued_date')
      .order('issued_date', { ascending: true });

    if (error) throw error;

    // Group by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend: Record<string, number> = {};

    (data || []).forEach(inv => {
      const date = new Date(inv.issued_date);
      const month = months[date.getMonth()];
      trend[month] = (trend[month] || 0) + (inv.total || 0);
    });

    return Object.entries(trend).map(([name, revenue]) => ({ name, revenue }));
  }
};
