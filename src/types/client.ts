export type ClientType = 'Individual' | 'Corporate' | 'Association';
export type ClientStatus = 'Active' | 'Inactive' | 'VIP' | 'Blacklisted';
export type CommunicationType = 'Call' | 'Email' | 'Meeting' | 'WhatsApp';
export type ContactRole = 'Representative' | 'Witness' | 'Opponent' | 'Advisor';

export interface CRMClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  type: ClientType;
  status: ClientStatus;
  tags: string[];
  notes?: string;
  since: string; // year
  avatar: string; // initials
  linkedCaseIds: string[];
  healthScore: number; // 0-100
  totalBilled: number;
  outstandingAmount: number;
  createdAt: string;
}

export interface Communication {
  id: string;
  clientId: string;
  caseId?: string;
  type: CommunicationType;
  date: string;
  summary: string;
  notes?: string;
  followUpDate?: string;
  loggedBy: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  role: ContactRole;
  phone?: string;
  email?: string;
  linkedCaseId?: string;
}
