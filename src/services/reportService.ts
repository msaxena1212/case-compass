import { supabase } from '@/lib/supabase';
import { Report, ReportFilters, ScheduledReport } from '@/types/report';

export const reportService = {
  async getAllReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*, generated_by_profile:profiles(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      filters: r.filters,
      generatedBy: r.generated_by_profile?.name || 'Unknown',
      fileUrl: r.file_url,
      createdAt: r.created_at
    })) as Report[];
  },

  async saveReport(report: Omit<Report, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        title: report.title,
        type: report.type,
        filters: report.filters,
        generated_by: report.generatedBy, // Expecting UUID here
        file_url: report.fileUrl
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getScheduledReports() {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(sr => ({
      id: sr.id,
      title: sr.title,
      userId: sr.user_id,
      reportType: sr.report_type,
      frequency: sr.frequency,
      recipients: sr.recipients,
      lastSent: sr.last_sent,
      nextRun: sr.next_run,
      status: sr.status,
      createdAt: sr.created_at
    })) as ScheduledReport[];
  },

  async createSchedule(schedule: Omit<ScheduledReport, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert([{
        title: schedule.title,
        user_id: schedule.userId,
        report_type: schedule.reportType,
        frequency: schedule.frequency,
        recipients: schedule.recipients,
        status: schedule.status
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAuditLogs(filters?: ReportFilters) {
    let query = supabase
      .from('audit_logs')
      .select('*, profile:profiles(name)')
      .order('timestamp', { ascending: false });

    if (filters?.dateRange) {
      query = query.gte('timestamp', filters.dateRange.from).lte('timestamp', filters.dateRange.to);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};
