export type AICapabilityType = 'case-summary' | 'contract-analysis' | 'legal-qa' | 'draft-petition';

export interface AICapability {
  type: AICapabilityType;
  icon: string;
  label: string;
  description: string;
  placeholder: string;
  color: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  capability?: AICapabilityType;
  metadata?: {
    confidence?: number;            // 0–1
    sources?: string[];
    disclaimer?: string;
    isStreaming?: boolean;
  };
}

export interface AISession {
  id: string;
  capability: AICapabilityType;
  caseId?: string;
  documentId?: string;
  messages: AIMessage[];
  createdAt: string;
}
