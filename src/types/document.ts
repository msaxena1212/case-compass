export type DocumentType = 'Petition' | 'Contract' | 'Evidence' | 'Order' | 'Affidavit' | 'Notice' | 'Agreement';
export type DocumentStatus = 'active' | 'archived' | 'processing' | 'pending';

export interface DocumentVersion {
  version: number;
  date: string;
  uploadedBy: string;
  note: string;
  fileUrl?: string;
}

export interface RiskClause {
  text: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface LegalDocument {
  id: string;
  caseId: string;
  caseName: string;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'docx' | 'image' | 'xlsx';
  documentType: DocumentType;
  tags: string[];
  versionNumber: number;
  versions: DocumentVersion[];
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  status: DocumentStatus;

  // AI-Processed Fields
  extractedText?: string;
  aiSummary?: string;
  aiKeywords?: string[];
  riskClauses?: RiskClause[];
  
  // Advanced Features
  signatureStatus?: 'Not Required' | 'Pending' | 'Signed';
  signedAt?: string;
  signedBy?: string;
  isEncrypted?: boolean;
  
  // Dedup
  hash?: string;
}
