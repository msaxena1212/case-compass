export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
export type PaymentMode = 'UPI' | 'Credit Card' | 'Bank Transfer' | 'Cash';

export interface TimeEntry {
  id: string;
  caseId: string;
  caseTitle?: string; // Joined field
  clientId: string;
  clientName?: string; // Joined field
  userId: string; // User who logged it
  date: string;
  durationMinutes: number;
  ratePerHour: number;
  description: string;
  billable: boolean;
  billed: boolean;
  linkedInvoiceId?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string; // e.g. INV-2026-001
  clientId: string;
  clientName?: string; // Joined field
  caseId?: string; // Optional if invoice is generic for client
  caseTitle?: string; // Joined field
  amount: number; // Subtotal
  tax: number; // e.g. 18% GST
  total: number;
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  referenceNumber?: string;
  notes?: string;
}
