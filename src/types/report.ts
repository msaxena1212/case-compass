export type ReportType = 'Case Summary' | 'Revenue' | 'Hearing History' | 'Audit Log';
export type ReportFrequency = 'Daily' | 'Weekly' | 'Monthly';

export interface ReportFilters {
  dateRange?: { from: string; to: string };
  startDate?: string;
  endDate?: string;
  caseId?: string | string[];
  clientId?: string | string[];
  userId?: string;
  status?: string;
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  filters: ReportFilters;
  generatedBy: string;
  fileUrl?: string;
  createdAt: string;
}

export interface ScheduledReport {
  id: string;
  title: string;
  userId: string;
  reportType: ReportType;
  frequency: ReportFrequency;
  recipients: string[];
  lastSent?: string;
  nextRun?: string;
  status: 'Active' | 'Paused';
  createdAt: string;
}
