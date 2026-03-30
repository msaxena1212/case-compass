export type CaseStatus = 'Draft' | 'Filed' | 'Ongoing' | 'Won' | 'Lost' | 'Settled' | 'Withdrawn' | 'Open' | 'Pending' | 'Hearing' | 'Closed';
export type CaseType = 'Civil' | 'Criminal' | 'Corporate';

export interface OpponentDetails {
  petitioner: string;
  respondent: string;
  opposingLawyer: string;
  judge?: string;
}

export interface Case {
  id: string; 
  title: string;
  type: CaseType;
  status: CaseStatus;
  court: string;
  caseNumber?: string;
  filingDate: string;
  lawyerId: string;
  clientId: string; 
  clientName?: string; // Joined field
  opponent: OpponentDetails;
  tags: string[];
  officeId: string;
  createdAt: string;
  updatedAt: string;
  healthScore: number; 
}

export interface AppCase extends Case {
  lawyerName: string;
  officeName: string;
}

export interface TimelineEntry {
  id: string;
  caseId: string;
  date: string;
  title: string;
  description: string;
  type: 'StatusChange' | 'HearingUpdate' | 'DocumentAdded' | 'NoteAdded';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'Individual' | 'Company';
}
