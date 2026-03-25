import { supabase } from '@/lib/supabase';
import { CourtCaseLink, CourtSyncLog, SyncStatus, CourtOrder } from '@/types/court';

export const courtTrackerService = {
  async getLinkedCases(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('court_case_links')
      .select('*, caseData:cases(*)', { count: 'exact' })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(l => ({
        id: l.id,
        caseId: l.case_id,
        courtType: l.court_type,
        courtName: l.court_name,
        cnrNumber: l.cnr_number,
        filingYear: l.filing_year,
        state: l.state,
        district: l.district,
        lastSyncedAt: l.last_synced_at,
        syncStatus: l.sync_status,
        caseData: l.caseData
      })) as (CourtCaseLink & { caseData: any })[],
      totalCount: count || 0
    };
  },

  async linkCase(link: Omit<CourtCaseLink, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('court_case_links')
      .insert([{
        case_id: link.caseId,
        court_type: link.courtType,
        court_name: link.courtName,
        cnr_number: link.cnrNumber,
        filing_year: link.filingYear,
        state: link.state,
        district: link.district,
        sync_status: link.syncStatus
      }])
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  async updateLinkStatus(id: string, status: string, lastSyncedAt: string) {
    const { data, error } = await supabase
      .from('court_case_links')
      .update({ sync_status: status, last_synced_at: lastSyncedAt })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  async simulateSync(caseId: string, cnr: string) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatesFound = Math.floor(Math.random() * 3);
    const status = Math.random() > 0.1 ? 'Success' : 'Failed';
    const message = status === 'Success' 
      ? `Successfully synced CNR ${cnr}. ${updatesFound} new orders found.`
      : `Connection timeout while reaching eCourts server for ${cnr}.`;

    const log = await this.addSyncLog({
      caseId,
      cnrNumber: cnr,
      status: status as SyncStatus,
      message,
      updatesFound,
      timestamp: new Date().toISOString()
    });

    const { data: links } = await supabase.from('court_case_links').select('id').eq('cnr_number', cnr).single();
    if (links) {
      await this.updateLinkStatus(links.id, status, new Date().toISOString());
    }

    return log;
  },

  async getCauseList(page: number = 1, pageSize: number = 10) {
    const allItems = [
      { cnrNumber: 'DL01-0001', caseTitle: 'State vs. Malhotra', courtRoom: 'Room 402', serialNumber: 12, stage: 'Evidence', scheduledTime: '10:30 AM' },
      { cnrNumber: 'MH02-0002', caseTitle: 'ICICI Bank vs. Global Corp', courtRoom: 'Room 105', serialNumber: 24, stage: 'Arguments', scheduledTime: '11:45 AM' },
      { cnrNumber: 'KA33-0003', caseTitle: 'Rita Devi vs. Municipal Corp', courtRoom: 'High Court 3', serialNumber: 5, stage: 'Admission', scheduledTime: '02:15 PM' }
    ];
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    return {
      data: allItems.slice(from, to),
      totalCount: allItems.length
    };
  },

  async getSyncLogs(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('court_sync_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(l => ({
        id: l.id,
        caseId: l.case_id,
        cnrNumber: l.cnr_number,
        status: l.status,
        message: l.message,
        updatesFound: l.updates_found,
        timestamp: l.timestamp
      })) as CourtSyncLog[],
      totalCount: count || 0
    };
  },

  async addSyncLog(log: Omit<CourtSyncLog, 'id'>) {
    const { data, error } = await supabase
      .from('court_sync_logs')
      .insert([{
        case_id: log.caseId,
        cnr_number: log.cnrNumber,
        status: log.status,
        message: log.message,
        updates_found: log.updatesFound,
        timestamp: log.timestamp
      }])
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  async getCourtOrders(caseId: string) {
    const { data, error } = await supabase
      .from('court_orders')
      .select('*')
      .eq('case_id', caseId)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(o => ({
      id: o.id,
      caseId: o.case_id,
      type: o.type,
      description: o.description,
      orderDate: o.order_date,
      nextHearingDate: o.next_hearing_date,
      sourceUrl: o.source_url
    })) as CourtOrder[];
  }
};
