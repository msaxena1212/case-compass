export type ContractType = 
  | 'NDA' | 'Service Agreement' | 'Employment Contract' 
  | 'Lease Agreement' | 'Vendor Agreement' | 'Partnership Deed' 
  | 'MOU' | 'Joint Venture' | 'Franchise Agreement';

export type ContractStatus = 
  | 'Draft' | 'Internal Review' | 'AI Risk Analysis' 
  | 'Pending Approval' | 'Approved' | 'Sent for Signing' 
  | 'Signed' | 'Expired' | 'Terminated';

export type ClauseType = 
  | 'Confidentiality' | 'Indemnification' | 'Termination' 
  | 'Payment Terms' | 'IP Ownership' | 'Jurisdiction' 
  | 'Force Majeure' | 'Dispute Resolution' | 'Non-Compete';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ContractClause {
  id: string;
  type: ClauseType;
  title: string;
  content: string;
  riskLevel: RiskLevel;
  aiFlag?: string;       // AI-highlighted concern
  isCustom: boolean;
}

export interface ContractApproval {
  id: string;
  contractId: string;
  approverName: string;
  role: string;
  status: ApprovalStatus;
  comment?: string;
  actionedAt?: string;
}

export interface Contract {
  id: string;
  title: string;
  type: ContractType;
  status: ContractStatus;
  parties: {
    partyA: string;    // Client / First party
    partyB: string;    // Counterparty
  };
  caseId?: string;
  clientId?: string;
  templateUsed?: string;
  riskScore: number;   // 0–100. Higher = riskier
  clauses: ContractClause[];
  approvals: ContractApproval[];
  value?: number;       // Contract value in INR
  startDate?: string;
  expiryDate?: string;
  signedDate?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ContractTemplate {
  id: string;
  type: ContractType;
  label: string;
  description: string;
  defaultClauses: ClauseType[];
  icon: string;
}
