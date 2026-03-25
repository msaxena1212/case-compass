export type HearingStatus = 'Upcoming' | 'Completed' | 'Missed' | 'Adjourned';

export interface Hearing {
  id: string;
  caseId: string;
  title: string;
  date: string; // ISO 8601 DateTime
  court: string;
  judge?: string;
  stage: string; 
  status: HearingStatus;
  notes?: string;
  outcome?: string;
  nextHearingId?: string;
  conflictWarning?: boolean; 
  riskScore?: number;
}
