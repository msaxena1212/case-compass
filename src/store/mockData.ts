import { Case, Client, TimelineEntry } from '../types/case';
import { Hearing } from '../types/hearing';
import { LegalDocument } from '../types/document';
import { CRMClient, Communication, Contact } from '../types/client';
import { TimeEntry, Invoice, Payment } from '../types/billing';
import { KnowledgeItem, LegalSection } from '../types/knowledge';
import { AppTask, WorkflowConfig } from '../types/task';
import { AppNotification, CommunicationLog } from '../types/communication';

export const mockClients: Client[] = [
  { id: 'cli_1', name: 'Acme Corp', email: 'contact@acme.com', phone: '+1234567890', type: 'Company' },
  { id: 'cli_2', name: 'John Doe', email: 'john@example.com', phone: '+0987654321', type: 'Individual' }
];

export const mockCases: Case[] = [
  {
    id: 'case_1',
    title: 'Acme vs Zenith - IP Dispute',
    type: 'Corporate',
    status: 'Ongoing',
    court: 'Delhi High Court',
    caseNumber: 'IP/2023/001',
    filingDate: '2023-11-15',
    lawyerId: 'law_1',
    clientId: 'cli_1',
    opponent: {
      petitioner: 'Acme Corp',
      respondent: 'Zenith Inc',
      opposingLawyer: 'Sarah Jenkins',
      judge: 'Hon. Justice Sharma'
    },
    tags: ['Intellectual Property', 'High Priority'],
    createdAt: '2023-11-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
    healthScore: 100
  },
  {
    id: 'case_2',
    title: 'State vs John Doe - Traffic Violation',
    type: 'Criminal',
    status: 'Filed',
    court: 'District Court',
    filingDate: '2024-01-20',
    lawyerId: 'law_2',
    clientId: 'cli_2',
    opponent: {
      petitioner: 'State Traffic Police',
      respondent: 'John Doe',
      opposingLawyer: 'Public Prosecutor',
    },
    tags: ['Traffic'],
    createdAt: '2024-01-18T09:30:00Z',
    updatedAt: '2024-01-20T11:45:00Z',
    healthScore: 85
  }
];

export const mockTimeline: TimelineEntry[] = [
  {
    id: 'tl_1',
    caseId: 'case_1',
    date: '2023-11-15T10:00:00Z',
    title: 'Case Filed',
    description: 'Initial petition filed in Delhi High Court.',
    type: 'StatusChange'
  },
  {
    id: 'tl_2',
    caseId: 'case_1',
    date: '2023-12-05T10:00:00Z',
    title: 'First Hearing',
    description: 'Notice issued to respondent.',
    type: 'HearingUpdate'
  }
];

// Helper to simulate store operations
export const generateId = (prefix: string = 'id') => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

export const mockHearings: Hearing[] = [
  {
    id: generateId('hrg'),
    caseId: 'case_1',
    title: 'Acme vs Zenith - IP Dispute',
    date: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(), // Today at 10:30 AM
    court: 'Delhi High Court',
    judge: 'Hon. Justice Sharma',
    stage: 'Arguments',
    status: 'Upcoming',
  },
  {
    id: generateId('hrg'),
    caseId: 'case_2',
    title: 'State vs John Doe - Traffic Violation',
    date: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), // Today at 2:00 PM
    court: 'District Court',
    stage: 'Evidence',
    status: 'Upcoming',
  },
  {
    id: generateId('hrg'),
    caseId: 'case_1',
    title: 'Acme vs Zenith - IP Dispute',
    date: new Date(new Date(new Date().setDate(new Date().getDate() + 5)).setHours(11, 0, 0, 0)).toISOString(), // 5 days from now
    court: 'Delhi High Court',
    stage: 'Cross Examination',
    status: 'Upcoming',
  }
];

export const checkHearingClash = (newDateIso: string): boolean => {
  const newDate = new Date(newDateIso);
  const BUFFER_MINUTES = 60; // 1 hour buffer

  return mockHearings.some(h => {
    if (h.status !== 'Upcoming') return false;
    const existingDate = new Date(h.date);
    
    // Check if dates are on the same day
    if (newDate.toDateString() !== existingDate.toDateString()) return false;
    
    // Calculate time difference in minutes
    const diffMinutes = Math.abs(newDate.getTime() - existingDate.getTime()) / (1000 * 60);
    return diffMinutes < BUFFER_MINUTES;
  });
};

export const calculateHealthScore = (c: Case): number => {
  // Simple mock logic: if it's ongoing and hasn't been updated recently, lower score
  const now = new Date();
  const updated = new Date(c.updatedAt);
  const diffDays = Math.floor((now.getTime() - updated.getTime()) / (1000 * 3600 * 24));
  
  if (c.status === 'Won' || c.status === 'Settled' || c.status === 'Withdrawn') return 100;
  if (c.status === 'Draft') return 50;
  
  if (diffDays > 30) return Math.max(10, 100 - (diffDays - 30));
  return 100;
};

// ============================================================
// Module 3: Document Management Mock Data
// ============================================================

export const mockDocuments: LegalDocument[] = [
  {
    id: 'doc_1',
    caseId: 'case_1',
    caseName: 'Acme vs Zenith - IP Dispute',
    fileName: 'Petition_Acme_vs_Zenith.pdf',
    fileUrl: '/docs/petition_acme.pdf',
    fileType: 'pdf',
    documentType: 'Petition',
    tags: ['petition', 'IP', 'high-court'],
    versionNumber: 3,
    versions: [
      { version: 3, date: 'Mar 10, 2026', uploadedBy: 'Adv. Kumar', note: 'Final revised petition with amended prayer' },
      { version: 2, date: 'Feb 28, 2026', uploadedBy: 'Adv. Kumar', note: 'Added additional grounds under Section 51' },
      { version: 1, date: 'Nov 15, 2023', uploadedBy: 'Adv. Kumar', note: 'Initial filing' },
    ],
    uploadedBy: 'Adv. Kumar',
    uploadedAt: '2026-03-10T10:00:00Z',
    size: '2.4 MB',
    status: 'active',
    extractedText: 'PETITION UNDER ARTICLE 226... The petitioner Acme Corp submits that the respondent Zenith Inc has willfully infringed upon the registered trademark... Section 29 of the Trade Marks Act, 1999... prayer for permanent injunction...',
    aiSummary: 'Petition filed under Article 226 claiming trademark infringement by Zenith Inc. Seeks permanent injunction and damages under Section 29 of Trade Marks Act. The petitioner holds valid trademark registration since 2018.',
    aiKeywords: ['trademark infringement', 'Section 29', 'Article 226', 'permanent injunction', 'Trade Marks Act'],
    riskClauses: [
      { text: 'The petitioner claims exclusive worldwide rights...', severity: 'medium', suggestion: 'Specify jurisdiction to limit scope' },
      { text: 'Damages to be assessed at a later stage...', severity: 'low', suggestion: 'Consider specifying a preliminary estimate' },
    ],
    hash: 'a1b2c3d4e5f6',
  },
  {
    id: 'doc_2',
    caseId: 'case_1',
    caseName: 'Acme vs Zenith - IP Dispute',
    fileName: 'Merger_Agreement_Draft_v2.docx',
    fileUrl: '/docs/merger_agreement.docx',
    fileType: 'docx',
    documentType: 'Contract',
    tags: ['contract', 'merger', 'corporate'],
    versionNumber: 2,
    versions: [
      { version: 2, date: 'Mar 8, 2026', uploadedBy: 'Adv. Mehta', note: 'Board-approved revisions' },
      { version: 1, date: 'Feb 10, 2026', uploadedBy: 'Adv. Mehta', note: 'Initial draft' },
    ],
    uploadedBy: 'Adv. Mehta',
    uploadedAt: '2026-03-08T09:30:00Z',
    size: '1.8 MB',
    status: 'active',
    extractedText: 'MERGER AGREEMENT between Acme Corp and subsidiary Beta LLC... Transaction value of $50M... Non-compete clause for 5 years... Indemnification obligations...',
    aiSummary: 'Merger agreement between Acme Corp and Beta LLC for $50M acquisition. Includes non-compete (5 years), indemnification caps at 30% of deal value, and customary representations & warranties.',
    aiKeywords: ['merger', 'acquisition', 'non-compete', 'indemnification', '$50M'],
    riskClauses: [
      { text: 'Indemnification capped at 30% of total transaction value...', severity: 'high', suggestion: 'Industry standard is 10-20%. Consider renegotiating the cap.' },
      { text: 'Non-compete extends to all geographies globally...', severity: 'high', suggestion: 'Overly broad. Restrict to relevant markets only.' },
      { text: 'Dispute resolution via arbitration in Singapore...', severity: 'medium', suggestion: 'Consider Indian jurisdiction for cost efficiency.' },
    ],
    hash: 'b2c3d4e5f6g7',
  },
  {
    id: 'doc_3',
    caseId: 'case_2',
    caseName: 'State vs John Doe - Traffic Violation',
    fileName: 'Property_Survey_Report.pdf',
    fileUrl: '/docs/survey_report.pdf',
    fileType: 'pdf',
    documentType: 'Evidence',
    tags: ['evidence', 'survey', 'property'],
    versionNumber: 1,
    versions: [
      { version: 1, date: 'Mar 5, 2026', uploadedBy: 'Adv. Kumar', note: 'Original survey report from Dept. of Revenue' },
    ],
    uploadedBy: 'Adv. Kumar',
    uploadedAt: '2026-03-05T14:00:00Z',
    size: '5.1 MB',
    status: 'active',
    extractedText: 'SURVEY REPORT NO. 2026/SR/4582... Plot No. 47, Sector 15... Total area: 2400 sq ft... Boundary dispute with adjacent property...',
    aiSummary: 'Official survey report for Plot No. 47, Sector 15 confirming total area of 2,400 sq ft. Documents boundary measurements and identifies encroachment of 180 sq ft by adjacent property owner.',
    aiKeywords: ['survey report', 'boundary dispute', 'encroachment', 'Plot 47', '2400 sq ft'],
    riskClauses: [],
    hash: 'c3d4e5f6g7h8',
  },
  {
    id: 'doc_4',
    caseId: 'case_2',
    caseName: 'State vs John Doe - Traffic Violation',
    fileName: 'Site_Photos_Evidence.zip',
    fileUrl: '/docs/site_photos.zip',
    fileType: 'image',
    documentType: 'Evidence',
    tags: ['evidence', 'photos', 'site-inspection'],
    versionNumber: 1,
    versions: [
      { version: 1, date: 'Mar 4, 2026', uploadedBy: 'Adv. Kumar', note: 'Site photographs taken during inspection' },
    ],
    uploadedBy: 'Adv. Kumar',
    uploadedAt: '2026-03-04T11:00:00Z',
    size: '12.3 MB',
    status: 'active',
    aiSummary: 'Collection of 24 site photographs documenting the current state of Plot No. 47 and surrounding boundary markers. Includes GPS-tagged images of the disputed encroachment area.',
    aiKeywords: ['site photos', 'evidence', 'GPS-tagged', 'boundary markers'],
    riskClauses: [],
    hash: 'd4e5f6g7h8i9',
  },
  {
    id: 'doc_5',
    caseId: 'case_1',
    caseName: 'Acme vs Zenith - IP Dispute',
    fileName: 'Settlement_Agreement_Draft.docx',
    fileUrl: '/docs/settlement_draft.docx',
    fileType: 'docx',
    documentType: 'Agreement',
    tags: ['settlement', 'agreement', 'negotiation'],
    versionNumber: 4,
    versions: [
      { version: 4, date: 'Mar 1, 2026', uploadedBy: 'Adv. Joshi', note: 'Revised terms per mediation session' },
      { version: 3, date: 'Feb 20, 2026', uploadedBy: 'Adv. Joshi', note: 'Counter-proposal from respondent' },
      { version: 2, date: 'Feb 5, 2026', uploadedBy: 'Adv. Joshi', note: 'Client review comments incorporated' },
      { version: 1, date: 'Dec 20, 2025', uploadedBy: 'Adv. Joshi', note: 'Initial draft' },
    ],
    uploadedBy: 'Adv. Joshi',
    uploadedAt: '2026-03-01T16:00:00Z',
    size: '890 KB',
    status: 'pending',
    extractedText: 'SETTLEMENT AGREEMENT... parties agree to mutual licensing arrangement... royalty at 5% of net revenue... non-disclosure obligations for 3 years...',
    aiSummary: 'Settlement agreement proposing mutual licensing of trademarks between Acme and Zenith. Key terms: 5% royalty on net revenue, 3-year NDA, and withdrawal of all pending litigation.',
    aiKeywords: ['settlement', 'mutual licensing', 'royalty', 'NDA', 'withdrawal'],
    riskClauses: [
      { text: '5% royalty applies retroactively from date of first infringement...', severity: 'high', suggestion: 'Retroactive application may be challenged. Consider prospective-only terms.' },
      { text: 'NDA extends to all employees and contractors without limit...', severity: 'medium', suggestion: 'Limit NDA scope to individuals directly involved in the matter.' },
    ],
    hash: 'e5f6g7h8i9j0',
  },
  {
    id: 'doc_6',
    caseId: 'case_1',
    caseName: 'Acme vs Zenith - IP Dispute',
    fileName: 'IP_Registration_Certificate.pdf',
    fileUrl: '/docs/ip_cert.pdf',
    fileType: 'pdf',
    documentType: 'Evidence',
    tags: ['certificate', 'IP', 'registration'],
    versionNumber: 1,
    versions: [
      { version: 1, date: 'Feb 28, 2026', uploadedBy: 'Adv. Kumar', note: 'Original certificate from IP Office' },
    ],
    uploadedBy: 'Adv. Kumar',
    uploadedAt: '2026-02-28T10:00:00Z',
    size: '340 KB',
    status: 'active',
    extractedText: 'CERTIFICATE OF REGISTRATION... Trademark Registration No. TM/2018/45823... Class 9 and 42... Valid until 2028...',
    aiSummary: 'Official trademark registration certificate for Acme Corp. Registration No. TM/2018/45823 covering Class 9 (software) and Class 42 (IT services). Valid from 2018 to 2028.',
    aiKeywords: ['trademark', 'registration', 'Class 9', 'Class 42', 'TM/2018/45823'],
    riskClauses: [],
    hash: 'f6g7h8i9j0k1',
  },
  {
    id: 'doc_7',
    caseId: 'case_2',
    caseName: 'State vs John Doe - Traffic Violation',
    fileName: 'Court_Order_Interim_Stay.pdf',
    fileUrl: '/docs/court_order_stay.pdf',
    fileType: 'pdf',
    documentType: 'Order',
    tags: ['order', 'interim', 'stay'],
    versionNumber: 1,
    versions: [
      { version: 1, date: 'Jan 15, 2026', uploadedBy: 'Adv. Kumar', note: 'Interim stay order from District Court' },
    ],
    uploadedBy: 'Adv. Kumar',
    uploadedAt: '2026-01-15T09:00:00Z',
    size: '1.2 MB',
    status: 'active',
    extractedText: 'ORDER... In the matter of State vs John Doe... the court hereby grants interim stay on the impounding of the vehicle... next date of hearing...',
    aiSummary: 'Interim stay order by District Court preventing impounding of the vehicle pending next hearing. Conditions: defendant must not drive until license status is resolved.',
    aiKeywords: ['interim stay', 'court order', 'impounding', 'vehicle', 'license'],
    riskClauses: [
      { text: 'Defendant must deposit security of ₹50,000...', severity: 'low', suggestion: 'Standard requirement. Ensure deposit is made before deadline.' },
    ],
    hash: 'g7h8i9j0k1l2',
  },
];

// Document Search Utility
export const searchDocuments = (query: string, docs: LegalDocument[] = mockDocuments): LegalDocument[] => {
  if (!query.trim()) return docs;
  const q = query.toLowerCase();
  return docs.filter(d =>
    d.fileName.toLowerCase().includes(q) ||
    d.caseName.toLowerCase().includes(q) ||
    d.documentType.toLowerCase().includes(q) ||
    d.tags.some(t => t.toLowerCase().includes(q)) ||
    (d.extractedText && d.extractedText.toLowerCase().includes(q)) ||
    (d.aiSummary && d.aiSummary.toLowerCase().includes(q)) ||
    (d.aiKeywords && d.aiKeywords.some(k => k.toLowerCase().includes(q)))
  );
};

// Duplicate Check Utility
export const checkDocumentDuplicate = (hash: string): LegalDocument | undefined => {
  return mockDocuments.find(d => d.hash === hash);
};

// ============================================================
// Module 4: Client CRM Mock Data
// ============================================================

export const mockCRMClients: CRMClient[] = [
  {
    id: 'cli_1',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '+91 22 2345 6789',
    address: '45 Tech Park, Bandra Kurla Complex, Mumbai',
    type: 'Corporate',
    status: 'Active',
    tags: ['Tech', 'High Value', 'Retainer'],
    notes: 'Key corporate client. Prefers email updates over phone calls.',
    since: '2019',
    avatar: 'AC',
    linkedCaseIds: ['case_1'],
    healthScore: 95,
    totalBilled: 1250000,
    outstandingAmount: 0,
    createdAt: '2019-05-12T10:00:00Z'
  },
  {
    id: 'cli_2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    address: '102 Maple Street, Andheri West, Mumbai',
    type: 'Individual',
    status: 'Active',
    tags: ['Pro-bono', 'Criminal'],
    notes: 'Traffic violation case. Needs frequent reassurance.',
    since: '2024',
    avatar: 'JD',
    linkedCaseIds: ['case_2'],
    healthScore: 60,
    totalBilled: 15000,
    outstandingAmount: 5000,
    createdAt: '2024-01-10T14:30:00Z'
  },
  {
    id: 'cli_3',
    name: 'Harpreet Singh',
    email: 'harpreet.s@email.com',
    phone: '+91 87654 32109',
    type: 'Individual',
    status: 'Active',
    tags: ['Property'],
    since: '2024',
    avatar: 'HS',
    linkedCaseIds: [],
    healthScore: 85,
    totalBilled: 50000,
    outstandingAmount: 0,
    createdAt: '2024-02-05T09:15:00Z'
  },
  {
    id: 'cli_4',
    name: 'Global Ventures Ltd.',
    email: 'legal@globalventures.com',
    phone: '+91 11 4567 8901',
    type: 'Corporate',
    status: 'VIP',
    tags: ['Investment', 'Corporate'],
    since: '2021',
    avatar: 'GV',
    linkedCaseIds: [],
    healthScore: 100,
    totalBilled: 4500000,
    outstandingAmount: 250000,
    createdAt: '2021-08-20T11:00:00Z'
  }
];

export const mockCommunications: Communication[] = [
  {
    id: 'comm_1',
    clientId: 'cli_1',
    caseId: 'case_1',
    type: 'Meeting',
    date: '2026-03-15T14:00:00Z',
    summary: 'Quarterly Review & Strategy for IP Case',
    notes: 'Discussed the upcoming cross-examination. Client approved the budget for expert witness.',
    loggedBy: 'Adv. Kumar'
  },
  {
    id: 'comm_2',
    clientId: 'cli_1',
    caseId: 'case_1',
    type: 'Email',
    date: '2026-03-12T09:30:00Z',
    summary: 'Sent revised settlement draft',
    loggedBy: 'Adv. Joshi'
  },
  {
    id: 'comm_3',
    clientId: 'cli_2',
    caseId: 'case_2',
    type: 'Call',
    date: '2026-03-10T16:45:00Z',
    summary: 'Client panicked about upcoming hearing',
    notes: 'Reassured client that interim stay is in place. Advised him not to drive.',
    followUpDate: '2026-03-18T10:00:00Z',
    loggedBy: 'Adv. Kumar'
  },
  {
    id: 'comm_4',
    clientId: 'cli_2',
    type: 'WhatsApp',
    date: '2026-03-08T11:00:00Z',
    summary: 'Payment reminder sent',
    loggedBy: 'Admin'
  }
];

export const mockContacts: Contact[] = [
  {
    id: 'cnt_1',
    clientId: 'cli_1',
    name: 'Sarah Jenkins',
    role: 'Representative',
    email: 'sarah.j@acme.com',
    phone: '+91 99999 88888'
  },
  {
    id: 'cnt_2',
    clientId: 'cli_1',
    name: 'Michael Chang',
    role: 'Advisor',
    email: 'm.chang@acme.com'
  },
  {
    id: 'cnt_3',
    clientId: 'cli_2',
    name: 'Ramesh Patel',
    role: 'Witness',
    phone: '+91 77777 66666',
    linkedCaseId: 'case_2'
  }
];

// ============================================================
// Module 5: Billing & Time Tracking Mock Data
// ============================================================

export const mockTimeEntries: TimeEntry[] = [
  {
    id: 'time_1',
    caseId: 'case_1',
    clientId: 'cli_1',
    userId: 'Adv. Kumar',
    date: '2026-03-15T10:00:00Z',
    durationMinutes: 210, // 3.5 hrs
    ratePerHour: 5000,
    description: 'Court hearing preparation and strategy drafting.',
    billable: true,
    billed: false,
    createdAt: '2026-03-15T13:30:00Z'
  },
  {
    id: 'time_2',
    caseId: 'case_1',
    clientId: 'cli_1',
    userId: 'Adv. Kumar',
    date: '2026-03-14T11:00:00Z',
    durationMinutes: 120, // 2 hrs
    ratePerHour: 5000,
    description: 'Witness interview and deposition planning.',
    billable: true,
    billed: false,
    createdAt: '2026-03-14T13:00:00Z'
  },
  {
    id: 'time_3',
    caseId: 'case_2',
    clientId: 'cli_2',
    userId: 'Adv. Mehta',
    date: '2026-03-14T09:00:00Z',
    durationMinutes: 300, // 5 hrs
    ratePerHour: 7500,
    description: 'Due diligence review of merger documents.',
    billable: true,
    billed: true,
    linkedInvoiceId: 'INV-2026-041',
    createdAt: '2026-03-14T14:00:00Z'
  },
  {
    id: 'time_4',
    caseId: 'case_2',
    clientId: 'cli_2',
    userId: 'Adv. Kumar',
    date: '2026-03-10T14:00:00Z',
    durationMinutes: 60, // 1 hr
    ratePerHour: 0,
    description: 'Internal team sync on case strategy.',
    billable: false,
    billed: false,
    createdAt: '2026-03-10T15:00:00Z'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'INV-2026-041',
    clientId: 'cli_1',
    caseId: 'case_1',
    amount: 56250,
    tax: 10125, // 18%
    total: 66375,
    issuedDate: '2026-03-01T00:00:00Z',
    dueDate: '2026-03-31T00:00:00Z',
    status: 'Paid',
    items: [
      { description: 'Due diligence review', hours: 5.0, rate: 7500, amount: 37500 },
      { description: 'Board meeting attendance', hours: 2.5, rate: 7500, amount: 18750 }
    ],
    notes: 'Thank you for your business. Payment received in full.'
  },
  {
    id: 'INV-2026-040',
    clientId: 'cli_2',
    caseId: 'case_2',
    amount: 27500,
    tax: 4950,
    total: 32450,
    issuedDate: '2026-02-28T00:00:00Z',
    dueDate: '2026-03-28T00:00:00Z',
    status: 'Unpaid',
    items: [
      { description: 'Court hearing preparation', hours: 3.5, rate: 5000, amount: 17500 },
      { description: 'Witness interview', hours: 2.0, rate: 5000, amount: 10000 }
    ],
    notes: 'Please remit payment within 30 days.'
  },
  {
    id: 'INV-2026-039',
    clientId: 'cli_3',
    caseId: 'case_3',
    amount: 20000,
    tax: 3600,
    total: 23600,
    issuedDate: '2026-02-15T00:00:00Z',
    dueDate: '2026-02-28T00:00:00Z',
    status: 'Overdue',
    items: [
      { description: 'Site inspection properties', hours: 4.0, rate: 5000, amount: 20000 }
    ],
    notes: 'Payment is now overdue. Please clear dues immediately to avoid late fees.'
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'pay_1',
    invoiceId: 'INV-2026-041',
    amount: 66375,
    date: '2026-03-05T10:30:00Z',
    mode: 'Bank Transfer',
  }
];

// ============================================================
// Module 6: Dashboard & Analytics Utilities
// ============================================================

export interface AIInsight {
  id: string;
  type: 'Opportunity' | 'Risk' | 'Info';
  message: string;
  actionText: string;
  actionLink: string;
}

export function generateDashboardInsights(): AIInsight[] {
  const insights: AIInsight[] = [];
  
  // 1. Revenue Insight
  const overdueInvs = mockInvoices.filter(i => i.status === 'Overdue');
  if (overdueInvs.length > 0) {
    const totalLate = overdueInvs.reduce((s, i) => s + i.total, 0);
    insights.push({
      id: 'ins_1',
      type: 'Risk',
      message: `You have ${overdueInvs.length} overdue invoices totaling ₹${totalLate.toLocaleString()}.`,
      actionText: 'Review Billing',
      actionLink: '/billing'
    });
  }

  // 2. Case Type Opportunity
  const caseCounts = mockCases.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Find top case type
  let topType = '';
  let topCount = 0;
  for (const [type, count] of Object.entries(caseCounts)) {
    if (count > topCount) {
      topCount = count;
      topType = type;
    }
  }

  if (topType) {
    insights.push({
      id: 'ins_2',
      type: 'Opportunity',
      message: `${topType} cases make up ${Math.round((topCount / mockCases.length) * 100)}% of your practice. Consider expanding marketing for this practice area.`,
      actionText: 'View Cases',
      actionLink: '/cases'
    });
  }

  // 3. Productivity Insight
  const unbilledTime = mockTimeEntries.filter(t => t.billable && !t.billed).reduce((s, t) => s + (t.durationMinutes/60)*t.ratePerHour, 0);
  if (unbilledTime > 10000) {
    insights.push({
      id: 'ins_3',
      type: 'Info',
      message: `You have ₹${unbilledTime.toLocaleString()} in unbilled time ready to be invoiced.`,
      actionText: 'Generate Invoice',
      actionLink: '/billing'
    });
  }
  return insights;
}

// ============================================================
// Module 7: Legal Knowledge Databank Mock Data
// ============================================================

export const mockLegalSections: LegalSection[] = [
  {
    id: 'sec_138',
    actName: 'Negotiable Instruments Act, 1881',
    sectionNumber: 'Section 138',
    description: 'Dishonour of cheque for insufficiency, etc., of funds in the account.'
  },
  {
    id: 'sec_420',
    actName: 'Indian Penal Code, 1860',
    sectionNumber: 'Section 420',
    description: 'Cheating and dishonestly inducing delivery of property.'
  },
  {
    id: 'sec_9',
    actName: 'Hindu Marriage Act, 1955',
    sectionNumber: 'Section 9',
    description: 'Restitution of conjugal rights.'
  }
];

export const mockKnowledgeItems: KnowledgeItem[] = [
  {
    id: 'judg_1',
    title: 'Dashrath Rupsingh Rathod v. State of Maharashtra',
    type: 'Judgment',
    snippet: 'Landmark Supreme Court judgment on territorial jurisdiction in Cheque Bounce (Section 138) cases.',
    content: `Supreme Court held that the territorial jurisdiction for filing a complaint under Section 138 of the Negotiable Instruments Act lies where the cheque is dishonoured by the bank on which it is drawn. This ruling altered the earlier approach where complaints could be filed at the payee's location.\n\nHeld: A complaint must be filed in the court within whose local jurisdiction the offence was committed, which is where the drawee bank is located.`,
    tags: ['Cheque Bounce', 'Jurisdiction', 'NI Act', 'Supreme Court'],
    aiSummary: 'This 2014 SC judgment ruled that complaints for dishonored cheques must be filed in the jurisdiction where the drawee bank is located, not the payee bank. It prevents harassment of the accused by filing cases in distant courts.',
    linkedSections: ['sec_138'],
    dateAdded: '2026-01-10T00:00:00Z',
    views: 145
  },
  {
    id: 'temp_1',
    title: 'Standard Legal Notice for Section 138 (Cheque Bounce)',
    type: 'Template',
    snippet: 'Ready-to-use template for issuing a 15-day statutory demand notice for a dishonored cheque.',
    content: `To,\n[Name of Drawer]\n[Address]\n\nSub: Legal Notice under Section 138 of the Negotiable Instruments Act, 1881\n\nDear Sir/Madam,\n\nUnder instructions from my client [Client Name], I am issuing this notice...`,
    tags: ['Template', 'Notice', 'NI Act', 'Drafting'],
    linkedSections: ['sec_138'],
    url: '#', // simulates a downloadable asset
    dateAdded: '2026-02-05T00:00:00Z',
    views: 320
  },
  {
    id: 'temp_2',
    title: 'Non-Disclosure Agreement (Corporate)',
    type: 'Template',
    snippet: 'Comprehensive mutual NDA template for corporate mergers and IP sharing.',
    content: `MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Agreement is entered into on [Date] by and between [Party A] and [Party B]...\n\n1. Definition of Confidential Information...\n2. Obligations of Receiving Party...`,
    tags: ['Corporate', 'Contract', 'NDA', 'IP'],
    url: '#',
    dateAdded: '2026-02-20T00:00:00Z',
    views: 89
  },
  {
    id: 'act_1',
    title: 'Indian Contract Act, 1872',
    type: 'Act',
    snippet: 'The core law regulating contracts in India, covering formation, performance, and breach.',
    content: 'Full text of the Indian Contract Act 1872...',
    tags: ['Bare Act', 'Civil', 'Corporate'],
    dateAdded: '2025-10-01T00:00:00Z',
    views: 512
  }
];

export function searchKnowledgeBase(query: string): KnowledgeItem[] {
  if (!query) return mockKnowledgeItems;
  const q = query.toLowerCase();
  return mockKnowledgeItems.filter(item => 
    item.title.toLowerCase().includes(q) || 
    item.snippet.toLowerCase().includes(q) || 
    item.tags.some(t => t.toLowerCase().includes(q)) ||
    item.aiSummary?.toLowerCase().includes(q)
  );
}

// ============================================================
// Module 8: Task & Workflow Mock Data
// ============================================================

export const mockWorkflows: WorkflowConfig[] = [
  {
    id: 'wf_civil_suit',
    name: 'Civil Suit Filing Workflow',
    caseType: 'Civil',
    templateTasks: [
      { title: 'Draft Initial Plaint', description: 'Prepare the draft for the civil plaint with all annexures.', daysOffset: 1, priority: 'High' },
      { title: 'Client Review & Sign', description: 'Get the drafted plaint signed by the client.', daysOffset: 3, priority: 'High' },
      { title: 'File in Court Registry', description: 'Submit the physical copies to the court registry.', daysOffset: 5, priority: 'High' },
      { title: 'Serve Notice to Defendant', description: 'Ensure notice is served via speed post and tracking updated.', daysOffset: 7, priority: 'Medium' }
    ]
  },
  {
    id: 'wf_section_138',
    name: 'Cheque Bounce (138) Workflow',
    caseType: 'Criminal',
    templateTasks: [
      { title: 'Send 15-Day Legal Notice', description: 'Draft and send statutory demand notice via registered post.', daysOffset: 1, priority: 'High' },
      { title: 'Draft Complaint', description: 'Prepare complaint if no payment received after 15 days.', daysOffset: 17, priority: 'High' },
      { title: 'File Complaint before Magistrate', description: 'Filing the Section 138 complaint.', daysOffset: 20, priority: 'High' }
    ]
  }
];

export const mockTasks: AppTask[] = [
  {
    id: 'tsk_1',
    title: 'Draft reply to legal notice',
    description: 'Prepare a response to the IP infringement notice from TechCorp detailing our prior art.',
    caseId: 'case_2', // Patel Merger (using loosely)
    assignedTo: 'Adv. Mehta',
    createdBy: 'Adv. Kumar',
    status: 'In Progress',
    priority: 'High',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // +2 days
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tsk_2',
    title: 'File application for adjournment',
    description: 'Main counsel is unavailable on the 25th. Draft and file adjournment.',
    caseId: 'case_1', // Sharma vs State
    assignedTo: 'Junior Associate',
    createdBy: 'Adv. Kumar',
    status: 'Pending',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // +5 days
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tsk_3',
    title: 'Review property registry documents',
    description: 'Check chain of title for the last 30 years.',
    caseId: 'case_3', 
    assignedTo: 'Adv. Joshi',
    createdBy: 'Adv. Kumar',
    status: 'Overdue',
    priority: 'High',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // -2 days
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tsk_4',
    title: 'Send invoice for February',
    caseId: undefined, // Firm admin task
    assignedTo: 'Admin',
    createdBy: 'Adv. Kumar',
    status: 'Completed',
    priority: 'Low',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// ============================================================
// Module 9: Communication & Notifications Mock Data
// ============================================================

export const mockNotifications: AppNotification[] = [
  {
    id: 'not_1',
    userId: 'user_1',
    type: 'Hearing',
    title: 'Upcoming Hearing Tomorrow',
    message: 'Review hearing for Sharma vs State in Court 4 at 10:30 AM.',
    channel: 'WhatsApp',
    status: 'Unread',
    actionUrl: '/calendar',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    metadata: { caseId: 'case_1', hearingId: '1' }
  },
  {
    id: 'not_2',
    userId: 'user_1',
    type: 'Task',
    title: 'New Task Assigned',
    message: 'Verify property registry documents for the Patel Merger case.',
    channel: 'In-App',
    status: 'Unread',
    actionUrl: '/tasks',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    metadata: { caseId: 'case_3', taskId: 'tsk_3' }
  },
  {
    id: 'not_3',
    userId: 'user_1',
    type: 'Billing',
    title: 'Invoice Overdue',
    message: 'Invoice INV-2024-001 for Acme Corp is now 3 days overdue.',
    channel: 'Email',
    status: 'Read',
    actionUrl: '/billing',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    metadata: { invoiceId: 'inv_1' }
  },
  {
    id: 'not_4',
    userId: 'user_1',
    type: 'Communication',
    title: 'Client Message',
    message: 'Acme Corp sent a document for the IP Litigation case.',
    channel: 'WhatsApp',
    status: 'Unread',
    actionUrl: '/cases/case_2',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    metadata: { caseId: 'case_2' }
  }
];

export const mockCommunicationLogs: CommunicationLog[] = [
  {
    id: 'log_1',
    caseId: 'case_1',
    clientId: 'cli_1',
    sender: 'Adv. Kumar',
    receiver: 'Acme Corp',
    content: 'The next hearing date is confirmed for April 12th.',
    channel: 'WhatsApp',
    status: 'Read',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'log_2',
    caseId: 'case_2',
    clientId: 'cli_2',
    sender: 'System',
    receiver: 'Patel Realty',
    content: 'Automated Reminder: Invoice INV-2024-002 is due in 2 days.',
    channel: 'Email',
    status: 'Delivered',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  }
];

export function getUnreadNotificationCount(): number {
  return mockNotifications.filter(n => n.status === 'Unread').length;
}

export function markNotificationAsRead(id: string) {
  const notif = mockNotifications.find(n => n.id === id);
  if (notif) notif.status = 'Read';
}

// ============================================================
// Module 10: AI Legal Intelligence Engine
// ============================================================

import { AICapability, AICapabilityType, AIMessage } from '../types/ai';

export const aiCapabilities: AICapability[] = [
  {
    type: 'case-summary',
    icon: '⚖️',
    label: 'Case Summarizer',
    description: 'Generate an instant executive summary of any case — facts, current status, and next steps.',
    placeholder: 'Summarize the current status of this matter and what needs to be done next.',
    color: 'indigo'
  },
  {
    type: 'contract-analysis',
    icon: '🔍',
    label: 'Contract Analyzer',
    description: 'Detect risky clauses, one-sided terms, and missing provisions in any agreement.',
    placeholder: 'Analyze this contract for unfair clauses, liability gaps, and enforceability risks.',
    color: 'rose'
  },
  {
    type: 'legal-qa',
    icon: '🧠',
    label: 'Legal Q&A',
    description: 'Ask any legal question and get AI answers with relevant case law and statute citations.',
    placeholder: 'What are the elements required to prove negligence in a tort claim under Indian law?',
    color: 'emerald'
  },
  {
    type: 'draft-petition',
    icon: '✍️',
    label: 'Petition Drafter',
    description: 'Auto-generate formal court petitions, plaints, or legal notices based on your case facts.',
    placeholder: 'Draft a Section 138 NI Act complaint for a dishonored cheque of ₹5,00,000.',
    color: 'amber'
  }
];

function buildAIResponse(capability: AICapabilityType, input: string, caseId?: string): string {
  const caseObj = caseId ? mockCases.find(c => c.id === caseId) : null;
  const caseName = caseObj?.title || 'the selected matter';

  switch (capability) {
    case 'case-summary':
      return `## Executive Summary — ${caseName}

**Nature of Dispute:** ${caseObj?.type || 'Civil'} litigation involving client ID ${caseObj?.clientId || 'the client'} against ${caseObj?.opponent?.respondent || 'the opposing party'}.

**Current Status:** The case is presently at the **${caseObj?.status || 'Active'}** stage. Hearings have been scheduled and the client's position appears strong based on the document trail.

**Key Facts:**
- The matter was filed on ${caseObj?.filingDate ? new Date(caseObj.filingDate).toLocaleDateString() : 'record date'}.
- Primary legal basis involves established precedents in ${caseObj?.type || 'Civil'} law.
- Check the calendar module for forthcoming hearing dates.

**Recommended Next Steps:**
1. Collate all documentary evidence before the next date.
2. Brief the client on the opposing party's likely arguments.
3. File any pending interlocutory applications at least 7 days prior to the next hearing.

> ⚠️ *AI Disclaimer: This summary is generated from available case data. Always verify with original documents before acting.*`;

    case 'contract-analysis':
      return `## Contract Risk Analysis

**Risk Level: 🔴 HIGH — 3 Critical Issues Identified**

---

### 🚨 Clause 8.2 — Unlimited Liability
**Issue:** The indemnification clause creates unlimited liability for your client with no cap on damages.
**Risk:** Exponentially disproportionate financial exposure in case of a dispute.
**Recommendation:** Negotiate a liability cap equal to 12 months of contract value.

---

### ⚠️ Clause 12 — Unilateral Termination
**Issue:** The opposing party retains the right to terminate the contract with 7 days notice, while your client requires 90 days.
**Risk:** One-sided and likely unenforceable under Indian Contract Act, Section 23.
**Recommendation:** Mirror the termination rights or negotiate mutual 30-day notice period.

---

### ⚠️ Clause 15.1 — Jurisdiction
**Issue:** The contract designates Singapore courts for dispute resolution, which significantly increases litigation costs for your client.
**Risk:** Practical barrier to pursuing valid legal remedies.
**Recommendation:** Negotiate a India-specific arbitration clause under ICADR rules.

---

**Positive Provisions:**
- Intellectual property ownership is clearly defined ✅
- Payment terms are specific and enforceable ✅

> ⚠️ *AI Disclaimer: This is a preliminary risk screening. A full legal review by counsel is required before concluding negotiations.*`;

    case 'legal-qa':
      return `## AI Legal Response

**Your Query:** *"${input.slice(0, 100)}${input.length > 100 ? '...' : ''}"*

---

### Answer

Based on established Indian law and Supreme Court precedents, here is the relevant legal position:

${input.toLowerCase().includes('138') || input.toLowerCase().includes('cheque') ? `
**Section 138 of the Negotiable Instruments Act, 1881** imposes criminal liability on drawers of dishonored cheques, subject to certain conditions:

1. The cheque must have been drawn for discharge of a legally enforceable debt or liability.
2. The cheque must have been presented within its validity period (3 months from date of issue).
3. A written demand notice must be sent within 30 days of receiving the bank's dishonor memo.
4. The drawer must have failed to pay within 15 days of receiving the notice.

**Key Case Law:**
- *Dashrath Rupsingh Rathod v. State of Maharashtra* (2014) — Jurisdiction lies where the drawee bank is situated.
- *Kusum Ingots & Alloys Ltd v. Pennar Peterson Securities Ltd* (2000) — On the nature of "legally enforceable debt."
` : `
The legal position under Indian law involves consideration of multiple statutes, including the Constitution of India, the Code of Civil Procedure, and applicable special laws.

**General Legal Principles Applicable:**
1. The burden of proof generally lies with the party making the assertion (Evidence Act, S. 101).
2. Courts will look to the legislative intent when construing ambiguous provisions.
3. Precedents of the Supreme Court are binding on all subordinate courts (Article 141).

**Relevant Jurisprudence:**
- *State of UP v. Synthetics and Chemicals Ltd* — On statutory interpretation.
- *Maneka Gandhi v. Union of India* — On due process and fundamental rights.
`}

> 📚 *Sources: Negotiable Instruments Act 1881 | Indian Penal Code 1860 | Supreme Court Judgments Database*
> ⚠️ *AI Disclaimer: This is for informational purposes only and does not constitute legal advice.*`;

    case 'draft-petition':
      return `## AI Generated Draft — Legal Notice / Petition

---

**IN THE COURT OF THE METROPOLITAN MAGISTRATE**
**[COURT NAME], [CITY]**

---

**Complaint Case No.: ____/2026**

**IN THE MATTER OF:**

[COMPLAINANT NAME], aged ___, residing at [ADDRESS] ... **Complainant**

**VERSUS**

[ACCUSED NAME], aged ___, residing at [ADDRESS] ... **Accused**

---

**COMPLAINT U/S 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881**

**MOST RESPECTFULLY SHOWETH:**

1. That the Complainant is a reputable businessman/individual engaged in [NATURE OF BUSINESS].

2. That the Accused had, in discharge of a legally enforceable debt of ₹[AMOUNT]/- (Rupees [AMOUNT IN WORDS] Only), drawn Cheque No. [CHEQUE NUMBER] dated [DATE] on [BANK NAME], [BRANCH].

3. That the said cheque, when presented to the Complainant's banker on [DATE], was returned dishonored vide memo dated [DATE] with the remark "FUNDS INSUFFICIENT."

4. That the Complainant issued a statutory legal notice dated [DATE] via Registered Post/Speed Post demanding payment within 15 days.

5. That the Accused failed to make payment within the stipulated period, thereby committing an offence punishable under Section 138 of the NI Act.

**PRAYER:**

It is therefore most respectfully prayed that this Hon'ble Court may be pleased to:

(a) Take cognizance of the offence committed by the Accused;
(b) Issue summons and proceed against the Accused in accordance with law;
(c) Award compensation as deemed fit.

And for this act of kindness, the Complainant shall ever pray.

**[COUNSEL FOR COMPLAINANT]**
**Date:**
**Place:**

---

> ✍️ *AI Draft — Replace all [BRACKETED] fields before filing. Verify all legal provisions with counsel.*`;

    default:
      return 'AI processing complete. Please review the output above.';
  }
}

export async function simulateAIRequest(
  capability: AICapabilityType,
  input: string,
  caseId?: string,
  onChunk?: (chunk: string) => void
): Promise<AIMessage> {
  const fullResponse = buildAIResponse(capability, input, caseId);
  
  // Simulate streaming word by word
  if (onChunk) {
    const words = fullResponse.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 18)); // ~18ms per word ≈ fast streaming
      onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
    }
  } else {
    await new Promise(r => setTimeout(r, 1800)); // Simulate thinking
  }

  return {
    id: `ai_msg_${Date.now()}`,
    role: 'assistant',
    content: fullResponse,
    timestamp: new Date().toISOString(),
    capability,
    metadata: {
      confidence: 0.87 + Math.random() * 0.1, // 87–97%
      sources: ['Indian Bare Acts Database', 'Supreme Court Judgments 2023', 'Firm Case Library'],
      disclaimer: 'AI-generated output. Verify before acting.'
    }
  };
}

// ============================================================
// Module 11: Court Integration System Mock Data
// ============================================================

import { CourtCaseLink, CourtOrder, SyncLog, CauseListEntry } from '../types/court';

export const mockCourtLinks: CourtCaseLink[] = [
  {
    id: 'cl_1',
    caseId: 'case_1',
    courtType: 'District Court',
    courtName: 'Additional Sessions Court, Mumbai',
    cnrNumber: 'MHNA01-002341-2023',
    filingYear: '2023',
    state: 'Maharashtra',
    district: 'Mumbai',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hrs ago
    syncStatus: 'Success'
  },
  {
    id: 'cl_2',
    caseId: 'case_2',
    courtType: 'High Court',
    courtName: 'Bombay High Court',
    cnrNumber: 'MHHC01-008872-2024',
    filingYear: '2024',
    state: 'Maharashtra',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hrs ago
    syncStatus: 'Success'
  }
];

export const mockCourtOrders: CourtOrder[] = [
  {
    id: 'ord_1',
    caseId: 'case_1',
    type: 'Hearing Scheduled',
    description: 'Next date fixed for arguments. Both counsels directed to file written submissions.',
    nextHearingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // +14 days
    judge: 'Hon. Justice R.K. Sharma',
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    sourceUrl: 'https://ecourts.gov.in/orders/mhna01-002341-2023'
  },
  {
    id: 'ord_2',
    caseId: 'case_1',
    type: 'Adjournment',
    description: 'Matter adjourned at the request of the Applicant\'s counsel. Cost of ₹2,000 imposed.',
    nextHearingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // +7 days
    judge: 'Hon. Justice R.K. Sharma',
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    sourceUrl: 'https://ecourts.gov.in/orders/mhna01-002341-2023-prev'
  },
  {
    id: 'ord_3',
    caseId: 'case_2',
    type: 'Notice Issued',
    description: 'Notice issued to the Respondents. Return date fixed. Respondents directed to file reply.',
    nextHearingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(), // +21 days
    judge: 'Hon. Justice A.K. Menon',
    orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    sourceUrl: 'https://ecourts.gov.in/orders/mhhc01-008872-2024'
  }
];

export const mockSyncLogs: SyncLog[] = [
  {
    id: 'log_s1',
    caseId: 'case_1',
    cnrNumber: 'MHNA01-002341-2023',
    status: 'Success',
    message: 'Fetched 2 updates: New hearing date + order uploaded.',
    updatesFound: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'log_s2',
    caseId: 'case_1',
    cnrNumber: 'MHNA01-002341-2023',
    status: 'Failed',
    message: 'eCourts portal timeout. Will retry in 30 minutes.',
    updatesFound: 0,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString()
  },
  {
    id: 'log_s3',
    caseId: 'case_2',
    cnrNumber: 'MHHC01-008872-2024',
    status: 'Success',
    message: 'Case status updated. 1 new order document available.',
    updatesFound: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString()
  }
];

export const mockCauseList: CauseListEntry[] = [
  {
    cnrNumber: 'MHNA01-002341-2023',
    caseTitle: 'Sharma vs State of Maharashtra',
    courtRoom: 'Court Room 4',
    serialNumber: 12,
    stage: 'Arguments',
    scheduledTime: '10:30 AM'
  },
  {
    cnrNumber: 'MHHC01-008872-2024',
    caseTitle: 'Tech Corp IP Litigation',
    courtRoom: 'Court Room 8 (High Court)',
    serialNumber: 5,
    stage: 'Admission',
    scheduledTime: '02:15 PM'
  }
];

export async function simulateCourtSync(caseId: string, cnrNumber: string): Promise<SyncLog> {
  await new Promise(r => setTimeout(r, 2500)); // Simulate API call

  // Randomly succeed or get partial data
  const isSuccess = Math.random() > 0.15;

  const log: SyncLog = {
    id: `log_s${Date.now()}`,
    caseId,
    cnrNumber,
    status: isSuccess ? 'Success' : 'Failed',
    message: isSuccess
      ? `Sync complete. Fetched latest hearing date and ${Math.floor(Math.random() * 2) + 1} order(s) from eCourts portal.`
      : 'Connection timeout. The eCourts server did not respond. Retry scheduled.',
    updatesFound: isSuccess ? Math.floor(Math.random() * 3) + 1 : 0,
    timestamp: new Date().toISOString()
  };

  // Update the link's sync status
  const link = mockCourtLinks.find(l => l.caseId === caseId);
  if (link) {
    link.syncStatus = log.status;
    link.lastSyncedAt = log.timestamp;
  }

  // Add to sync logs
  mockSyncLogs.unshift(log);

  return log;
}

// ============================================================
// Module 12: Contract Lifecycle Management (CLM) Mock Data
// ============================================================

import { Contract, ContractTemplate, ContractClause } from '../types/contract';

export const contractTemplates: ContractTemplate[] = [
  {
    id: 'tpl_nda',
    type: 'NDA',
    label: 'Non-Disclosure Agreement',
    description: 'Standard bilateral NDA for business partnerships and vendor engagements.',
    defaultClauses: ['Confidentiality', 'IP Ownership', 'Termination', 'Jurisdiction'],
    icon: '🔒'
  },
  {
    id: 'tpl_service',
    type: 'Service Agreement',
    label: 'Service Agreement',
    description: 'Comprehensive services contract with SLAs, payment terms, and deliverables.',
    defaultClauses: ['Payment Terms', 'Termination', 'Indemnification', 'Dispute Resolution', 'Force Majeure'],
    icon: '⚙️'
  },
  {
    id: 'tpl_employment',
    type: 'Employment Contract',
    label: 'Employment Contract',
    description: 'Full-time employment agreement with probation, CTC, and IP assignment.',
    defaultClauses: ['Confidentiality', 'Non-Compete', 'IP Ownership', 'Termination'],
    icon: '🧑‍💼'
  },
  {
    id: 'tpl_lease',
    type: 'Lease Agreement',
    label: 'Lease Agreement',
    description: 'Commercial or residential lease with rent escalation and exit clauses.',
    defaultClauses: ['Payment Terms', 'Termination', 'Force Majeure', 'Jurisdiction'],
    icon: '🏢'
  },
  {
    id: 'tpl_vendor',
    type: 'Vendor Agreement',
    label: 'Vendor Agreement',
    description: 'Procurement agreement for goods/services with quality and payment milestones.',
    defaultClauses: ['Payment Terms', 'Indemnification', 'Dispute Resolution', 'Termination'],
    icon: '📦'
  }
];

export const mockContracts: Contract[] = [
  {
    id: 'con_1',
    title: 'NDA — Acme Corp & TechPartner Solutions',
    type: 'NDA',
    status: 'Signed',
    parties: { partyA: 'Acme Corp', partyB: 'TechPartner Solutions Pvt. Ltd.' },
    clientId: 'cli_1',
    caseId: 'case_2',
    templateUsed: 'tpl_nda',
    riskScore: 22,
    value: 0,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 305).toISOString(),
    signedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    version: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    clauses: [
      {
        id: 'cl_1_1', type: 'Confidentiality', isCustom: false, riskLevel: 'Low',
        title: 'Mutual Confidentiality Obligation',
        content: 'Both parties agree to maintain strict confidentiality of all disclosed information for a period of 3 years from the date of disclosure.'
      },
      {
        id: 'cl_1_2', type: 'IP Ownership', isCustom: false, riskLevel: 'Low',
        title: 'Intellectual Property Rights',
        content: 'All intellectual property developed during the engagement shall remain solely with the disclosing party.'
      },
      {
        id: 'cl_1_3', type: 'Jurisdiction', isCustom: false, riskLevel: 'Low',
        title: 'Governing Law & Jurisdiction',
        content: 'This Agreement shall be governed by the laws of Maharashtra and subject to the exclusive jurisdiction of courts in Mumbai.'
      }
    ],
    approvals: [
      { id: 'appr_1_1', contractId: 'con_1', approverName: 'Adv. Kumar', role: 'Senior Partner', status: 'Approved', actionedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString() },
      { id: 'appr_1_2', contractId: 'con_1', approverName: 'Rohan Verma', role: 'Business Head', status: 'Approved', actionedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 47).toISOString() }
    ]
  },
  {
    id: 'con_2',
    title: 'Service Agreement — Patel Realty & BuildPro Ltd.',
    type: 'Service Agreement',
    status: 'Pending Approval',
    parties: { partyA: 'Patel Realty Pvt. Ltd.', partyB: 'BuildPro Construction Ltd.' },
    clientId: 'cli_2',
    templateUsed: 'tpl_service',
    riskScore: 68,
    value: 45000000,
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 375).toISOString(),
    version: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    clauses: [
      {
        id: 'cl_2_1', type: 'Payment Terms', isCustom: false, riskLevel: 'Medium',
        title: 'Payment Schedule',
        content: '30% advance on signing, 40% on milestone completion, 30% on project handover. Delayed payment attracts 18% p.a. interest.',
        aiFlag: 'High interest rate clause may be challenged under Section 74 of the Indian Contract Act.'
      },
      {
        id: 'cl_2_2', type: 'Indemnification', isCustom: true, riskLevel: 'High',
        title: 'Unlimited Indemnification',
        content: 'Party B shall indemnify Party A against all losses, damages, costs, and expenses of any nature whatsoever.',
        aiFlag: '🚨 Unlimited indemnification is one-sided and unenforceable. Recommend capping at contract value.'
      },
      {
        id: 'cl_2_3', type: 'Termination', isCustom: false, riskLevel: 'Medium',
        title: 'Termination for Convenience',
        content: 'Either party may terminate this Agreement upon 90 days written notice.',
      },
      {
        id: 'cl_2_4', type: 'Dispute Resolution', isCustom: false, riskLevel: 'Low',
        title: 'Arbitration Clause',
        content: 'All disputes shall be resolved by arbitration under the Arbitration & Conciliation Act, 1996 by a sole arbitrator appointed by mutual consent.'
      }
    ],
    approvals: [
      { id: 'appr_2_1', contractId: 'con_2', approverName: 'Adv. Kumar', role: 'Senior Partner', status: 'Approved', actionedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
      { id: 'appr_2_2', contractId: 'con_2', approverName: 'Priya Sharma', role: 'CFO — Patel Realty', status: 'Pending' }
    ]
  },
  {
    id: 'con_3',
    title: 'Vendor Agreement — StarMetals & AlloySupply Co.',
    type: 'Vendor Agreement',
    status: 'Draft',
    parties: { partyA: 'StarMetals Industries', partyB: 'AlloySupply Co. Pvt. Ltd.' },
    templateUsed: 'tpl_vendor',
    riskScore: 41,
    value: 8500000,
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    clauses: [
      {
        id: 'cl_3_1', type: 'Payment Terms', isCustom: false, riskLevel: 'Low',
        title: 'Payment Terms',
        content: 'Net 45 days from invoice date. All payments via NEFT/RTGS only.'
      },
      {
        id: 'cl_3_2', type: 'Force Majeure', isCustom: false, riskLevel: 'Low',
        title: 'Force Majeure',
        content: 'Neither party shall be liable for failure to perform due to events beyond reasonable control including natural disasters, government actions, or pandemics.'
      }
    ],
    approvals: []
  },
  {
    id: 'con_4',
    title: 'Employment Contract — Sr. Manager (Acme Corp)',
    type: 'Employment Contract',
    status: 'Sent for Signing',
    parties: { partyA: 'Acme Corp', partyB: 'Rahul Mehta' },
    clientId: 'cli_1',
    templateUsed: 'tpl_employment',
    riskScore: 15,
    value: 2400000,
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    version: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    clauses: [
      {
        id: 'cl_4_1', type: 'Non-Compete', isCustom: false, riskLevel: 'Medium',
        title: 'Non-Compete Clause',
        content: 'Employee shall not engage with any competing business within India for 12 months post-termination.',
        aiFlag: '⚠️ Non-compete enforceability in India is limited under Section 27 of Indian Contract Act. Consider narrowing the scope.'
      },
      {
        id: 'cl_4_2', type: 'IP Ownership', isCustom: false, riskLevel: 'Low',
        title: 'IP Assignment',
        content: 'All work product created during employment is the exclusive property of the Employer.'
      }
    ],
    approvals: [
      { id: 'appr_4_1', contractId: 'con_4', approverName: 'Adv. Kumar', role: 'Senior Partner', status: 'Approved', actionedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
      { id: 'appr_4_2', contractId: 'con_4', approverName: 'HR Director', role: 'HR — Acme Corp', status: 'Approved', actionedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() }
    ]
  }
];

export function addContract(contract: Contract) {
  mockContracts.unshift(contract);
}

// ============================================================
// Module 13: Multi-Office / Firm Management Mock Data
// ============================================================

import { Office, FirmUser, RevenueMetric } from '../types/firm';

export const mockOffices: Office[] = [
  {
    id: 'off_delhi',
    name: 'Delhi HQ',
    location: 'Delhi',
    address: 'Connaught Place, New Delhi, 110001',
    phone: '+91 11 4455 6677',
    managerId: 'user_1',
    staffCount: 45,
    activeCasesCount: 128,
    monthlyRevenue: 8500000,
    status: 'Active'
  },
  {
    id: 'off_mumbai',
    name: 'Mumbai Branch',
    location: 'Mumbai',
    address: 'Nariman Point, Mumbai, 400021',
    phone: '+91 22 2288 3344',
    managerId: 'user_2',
    staffCount: 32,
    activeCasesCount: 94,
    monthlyRevenue: 6200000,
    status: 'Active'
  },
  {
    id: 'off_bangalore',
    name: 'Bangalore Tech Hub',
    location: 'Bangalore',
    address: 'Indiranagar, Bangalore, 560038',
    phone: '+91 80 6677 8899',
    managerId: 'user_3',
    staffCount: 18,
    activeCasesCount: 52,
    monthlyRevenue: 3800000,
    status: 'Active'
  }
];

export const mockFirmUsers: FirmUser[] = [
  { id: 'user_1', name: 'Adv. Rajesh Kumar', email: 'rajesh@casecompass.com', role: 'Partner', officeId: 'off_delhi', department: 'Litigation', status: 'Active' },
  { id: 'user_2', name: 'Adv. Priya Sharma', email: 'priya@casecompass.com', role: 'Partner', officeId: 'off_mumbai', department: 'Corporate', status: 'Active' },
  { id: 'user_3', name: 'Adv. Vikram Singh', email: 'vikram@casecompass.com', role: 'Senior Lawyer', officeId: 'off_bangalore', department: 'IP', status: 'Active' },
  { id: 'user_4', name: 'Sanjay Gupta', email: 'sanjay@casecompass.com', role: 'Associate', officeId: 'off_delhi', department: 'Criminal', status: 'Active' },
  { id: 'user_5', name: 'Ananya Iyer', email: 'ananya@casecompass.com', role: 'Junior', officeId: 'off_mumbai', department: 'Family', status: 'On Leave' },
  { id: 'user_admin', name: 'System Admin', email: 'admin@casecompass.com', role: 'Admin', officeId: 'off_delhi', department: 'Admin', status: 'Active' }
];

export const mockRevenueMetrics: RevenueMetric[] = [
  { officeId: 'off_delhi', month: 'Jan', revenue: 7800000, target: 7500000 },
  { officeId: 'off_delhi', month: 'Feb', revenue: 8200000, target: 7500000 },
  { officeId: 'off_delhi', month: 'Mar', revenue: 8500000, target: 8000000 },
  { officeId: 'off_mumbai', month: 'Jan', revenue: 5800000, target: 6000000 },
  { officeId: 'off_mumbai', month: 'Feb', revenue: 6100000, target: 6000000 },
  { officeId: 'off_mumbai', month: 'Mar', revenue: 6200000, target: 6500000 },
  { officeId: 'off_bangalore', month: 'Jan', revenue: 3200000, target: 3000000 },
  { officeId: 'off_bangalore', month: 'Feb', revenue: 3500000, target: 3000000 },
  { officeId: 'off_bangalore', month: 'Mar', revenue: 3800000, target: 3500000 }
];

// ============================================================
// Module 14: Security, Compliance & Audit Mock Data
// ============================================================

import { AuditLog, SecurityEvent, AccessControlRule } from '../types/security';

export const mockAuditLogs: AuditLog[] = [
  { id: 'log_1', userId: 'user_1', userName: 'Adv. Rajesh Kumar', action: 'Login', resource: 'System', resourceType: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), ipAddress: '192.168.1.45', status: 'Success' },
  { id: 'log_2', userId: 'user_2', userName: 'Adv. Priya Sharma', action: 'Update Case Status', resource: 'case_1', resourceType: 'Case', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), ipAddress: '103.45.2.11', status: 'Success' },
  { id: 'log_3', userId: 'user_3', userName: 'Adv. Vikram Singh', action: 'Download Document', resource: 'doc_2', resourceType: 'Document', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), ipAddress: '122.160.4.5', status: 'Success' },
  { id: 'log_4', userId: 'user_4', userName: 'Sanjay Gupta', action: 'Delete Task', resource: 'task_5', resourceType: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), ipAddress: '192.168.1.12', status: 'Success' },
  { id: 'log_5', userId: 'user_admin', userName: 'System Admin', action: 'Change Firm Settings', resource: 'Configuration', resourceType: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(), ipAddress: '1.1.1.1', status: 'Success' },
  { id: 'log_6', userId: 'user_5', userName: 'Ananya Iyer', action: 'Failed Login Attempt', resource: 'System', resourceType: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), ipAddress: '172.16.0.8', status: 'Failure' },
  { id: 'log_7', userId: 'user_1', userName: 'Adv. Rajesh Kumar', action: 'Approve Invoice', resource: 'inv_102', resourceType: 'Invoice', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), ipAddress: '192.168.1.45', status: 'Success' },
  { id: 'log_8', userId: 'user_2', userName: 'Adv. Priya Sharma', action: 'View Contract', resource: 'con_1', resourceType: 'Contract', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), ipAddress: '103.45.2.11', status: 'Success' }
];

export const mockSecurityEvents: SecurityEvent[] = [
  { id: 'sec_1', type: 'Failed Login', severity: 'Medium', message: '3 failed login attempts for user ananya@casecompass.com within 5 minutes.', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), ipAddress: '172.16.0.8', resolved: false },
  { id: 'sec_2', type: 'Data Export', severity: 'High', message: 'Massive document download (45 files) detected by user vikram@casecompass.com.', timestamp: new Date(Date.now() - 1000 * 60 * 185).toISOString(), ipAddress: '122.160.4.5', resolved: true, resolvedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(), resolvedBy: 'admin' },
  { id: 'sec_3', type: 'Access Denied', severity: 'Low', message: 'Junior Associate attempted to access Billing module.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), ipAddress: '192.168.1.88', resolved: false }
];

export const mockAccessControl: AccessControlRule[] = [
  { role: 'Partner', module: 'Cases', actions: ['View', 'Edit', 'Delete', 'Export'] },
  { role: 'Partner', module: 'Billing', actions: ['View', 'Edit', 'Delete', 'Export'] },
  { role: 'Lawyer', module: 'Cases', actions: ['View', 'Edit', 'Export'] },
  { role: 'Lawyer', module: 'Billing', actions: ['View'] },
  { role: 'Junior Associate', module: 'Cases', actions: ['View', 'Edit'] },
  { role: 'Junior Associate', module: 'Billing', actions: [] },
  { role: 'Admin', module: 'System', actions: ['View', 'Edit', 'Delete', 'Export'] }
];

export function addAuditLog(log: Omit<AuditLog, 'id'>) {
  const newLog: AuditLog = {
    ...log,
    id: `log_${Date.now()}`
  };
  mockAuditLogs.unshift(newLog);
}

// ============================================================
// Module 15: Integration & API Ecosystem Mock Data
// ============================================================

import { Integration, ApiKey, ApiSyncLog } from '../types/integration';

export const mockIntegrations: Integration[] = [
  {
    id: 'int_1',
    provider: 'Gmail',
    type: 'Email',
    status: 'Connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    icon: '📧',
    description: 'Sync case emails and client communications directly from your inbox.'
  },
  {
    id: 'int_2',
    provider: 'Google Calendar',
    type: 'Calendar',
    status: 'Connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    icon: '📅',
    description: 'Auto-sync court hearings and task deadlines with your Google Calendar.'
  },
  {
    id: 'int_3',
    provider: 'Razorpay',
    type: 'Payment',
    status: 'Connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    icon: '💳',
    description: 'Generate payment links and track automated invoice settlements.'
  },
  {
    id: 'int_4',
    provider: 'WhatsApp',
    type: 'Communication',
    status: 'Disconnected',
    icon: '📱',
    description: 'Send automated hearing alerts and document reminders via WhatsApp.'
  },
  {
    id: 'int_5',
    provider: 'Outlook',
    type: 'Email',
    status: 'Disconnected',
    icon: '✉️',
    description: 'Alternative email sync for firms using Microsoft 365.'
  }
];

export const mockApiKeys: ApiKey[] = [
  {
    id: 'key_1',
    name: 'Mobile App Sync',
    key: 'ck_live_6782...890',
    role: 'Write-Only',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    status: 'Active'
  },
  {
    id: 'key_2',
    name: 'Analytics Dashboard',
    key: 'ck_live_1122...334',
    role: 'Read-Only',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'Active'
  },
  {
    id: 'key_3',
    name: 'Legacy CRM Bridge',
    key: 'ck_live_9988...776',
    role: 'Admin',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    status: 'Revoked'
  }
];

export const mockApiSyncLogs: ApiSyncLog[] = [
  { id: 'syn_1', integrationId: 'int_1', provider: 'Gmail', event: 'Email Sync', status: 'Success', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), details: '24 new emails processed.' },
  { id: 'syn_2', integrationId: 'int_2', provider: 'Google Calendar', event: 'Calendar Sync', status: 'Success', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), details: '3 hearings added to calendar.' },
  { id: 'syn_3', integrationId: 'int_3', provider: 'Razorpay', event: 'Payment Webhook', status: 'Success', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), details: 'Invoice #IPV-2024-041 paid.' },
  { id: 'syn_4', integrationId: 'int_1', provider: 'Gmail', event: 'Email Sync', status: 'Failure', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), details: 'Authentication token expired.' },
  { id: 'syn_5', integrationId: 'int_2', provider: 'Google Calendar', event: 'Calendar Sync', status: 'Success', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), details: 'No new events.' }
];

export function generateApiKey(name: string, role: ApiKey['role']): ApiKey {
  const newKey: ApiKey = {
    id: `key_${Date.now()}`,
    name,
    key: `ck_live_${Math.random().toString(36).substring(2, 11)}...${Math.random().toString(36).substring(2, 5)}`,
    role,
    createdAt: new Date().toISOString(),
    status: 'Active'
  };
  mockApiKeys.unshift(newKey);
  return newKey;
}
