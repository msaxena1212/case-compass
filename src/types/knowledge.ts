export type KnowledgeType = 'Judgment' | 'Template' | 'Act';

export interface KnowledgeItem {
  id: string;
  title: string;
  type: KnowledgeType;
  snippet: string; // Used for list view
  content: string; // Full markdown or text
  tags: string[];
  aiSummary?: string; // Only for judgments or long acts
  linkedSections?: string[]; // IDs of LegalSections
  url?: string; // Mock download link for templates/pdfs
  dateAdded: string;
  views: number;
}

export interface LegalSection {
  id: string;
  actName: string;
  sectionNumber: string;
  description: string;
}
