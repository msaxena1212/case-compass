export type CourtType = 'District Court' | 'High Court' | 'Supreme Court' | 'Tribunal' | 'Family Court' | 'Consumer Court';
export type SyncStatus = 'Success' | 'Failed' | 'Pending' | 'In Progress';
export type OrderType = 'Hearing Scheduled' | 'Adjournment' | 'Order Upload' | 'Judgment' | 'Notice Issued';

export interface CourtCaseLink {
  id: string;
  caseId: string;           // Our internal case ID
  courtType: CourtType;
  courtName: string;
  cnrNumber: string;         // Case Number Record — eCourts standard
  filingYear: string;
  state: string;
  district?: string;
  lastSyncedAt?: string;
  syncStatus: SyncStatus;
}

export interface CourtOrder {
  id: string;
  caseId: string;
  type: OrderType;
  description: string;
  nextHearingDate?: string;
  judge?: string;
  orderDate: string;
  sourceUrl?: string;
}

export interface SyncLog {
  id: string;
  caseId: string;
  cnrNumber: string;
  status: SyncStatus;
  message: string;
  updatesFound: number;
  timestamp: string;
}

export interface CauseListEntry {
  cnrNumber: string;
  caseTitle: string;
  courtRoom: string;
  serialNumber: number;
  stage: string;
  scheduledTime?: string;
}
