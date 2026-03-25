import { supabase } from '@/lib/supabase';
import { Invoice, Payment, TimeEntry } from '@/types/billing';

export const billingService = {
  async getAllInvoices() {
    const { data, error } = await supabase
      .from('billing_invoices')
      .select('*, client:clients(name), case:cases(title)')
      .order('issued_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(i => ({
      id: i.id,
      clientId: i.client_id,
      clientName: i.client?.name,
      caseId: i.case_id,
      caseTitle: i.case?.title,
      amount: i.amount,
      tax: i.tax,
      total: i.total,
      issuedDate: i.issued_date,
      dueDate: i.due_date,
      status: i.status,
      items: i.items || [],
      notes: i.notes,
      createdAt: i.created_at
    })) as Invoice[];
  },

  async getInvoiceById(id: string) {
    const { data, error } = await supabase
      .from('billing_invoices')
      .select('*, payments:billing_payments(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Invoice;
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt'> & { timeEntryIds?: string[] }) {
    const { timeEntryIds, ...dataToInsert } = invoiceData;
    
    // 1. Create the invoice
    const { data: invoice, error: invError } = await supabase
      .from('billing_invoices')
      .insert([{
        client_id: dataToInsert.clientId,
        case_id: dataToInsert.caseId,
        amount: dataToInsert.amount,
        tax: dataToInsert.tax,
        total: dataToInsert.total,
        issued_date: dataToInsert.issuedDate,
        due_date: dataToInsert.dueDate,
        status: dataToInsert.status,
        items: dataToInsert.items,
        notes: dataToInsert.notes
      }])
      .select()
      .single();

    if (invError) throw invError;

    // 2. Link time entries if provided
    if (timeEntryIds && timeEntryIds.length > 0) {
      const { error: timeError } = await supabase
        .from('time_entries')
        .update({ 
          billed: true, 
          linked_invoice_id: invoice.id 
        })
        .in('id', timeEntryIds);
      
      if (timeError) throw timeError;
    }

    return invoice as Invoice;
  },

  async recordPayment(paymentData: Omit<Payment, 'id'>) {
    const { data: payment, error: payError } = await supabase
      .from('billing_payments')
      .insert([{
        invoice_id: paymentData.invoiceId,
        amount: paymentData.amount,
        date: paymentData.date,
        mode: paymentData.mode,
        reference_number: paymentData.referenceNumber,
        notes: paymentData.notes
      }])
      .select()
      .single();

    if (payError) throw payError;

    // Update invoice status based on total paid
    const { data: payments, error: listError } = await supabase
      .from('billing_payments')
      .select('amount')
      .eq('invoice_id', paymentData.invoiceId);
    
    if (!listError) {
      const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
      const { data: inv } = await supabase
        .from('billing_invoices')
        .select('total')
        .eq('id', paymentData.invoiceId)
        .single();
      
      if (inv) {
        const newStatus = totalPaid >= inv.total ? 'Paid' : 'Partial';
        await supabase
          .from('billing_invoices')
          .update({ status: newStatus })
          .eq('id', paymentData.invoiceId);
      }
    }

    return payment as Payment;
  },

  async getAllPayments(invoiceId?: string) {
    let query = supabase.from('billing_payments').select('*');
    if (invoiceId) query = query.eq('invoice_id', invoiceId);
    
    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    
    return data.map(p => ({
      id: p.id,
      invoiceId: p.invoice_id,
      amount: p.amount,
      date: p.date,
      mode: p.mode,
      referenceNumber: p.reference_number,
      notes: p.notes
    })) as Payment[];
  },

  async getTimeEntries(caseId?: string) {
    let query = supabase
      .from('time_entries')
      .select('*, case:cases(title), client:clients(name)')
      .order('date', { ascending: false });

    if (caseId) {
      query = query.eq('case_id', caseId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(t => ({
      id: t.id,
      caseId: t.case_id,
      caseTitle: t.case?.title,
      clientId: t.client_id,
      clientName: t.client?.name,
      userId: t.user_id,
      date: t.date,
      durationMinutes: t.duration_minutes,
      ratePerHour: t.rate_per_hour,
      description: t.description,
      billable: t.billable,
      billed: t.billed,
      linkedInvoiceId: t.linked_invoice_id,
      createdAt: t.created_at
    })) as TimeEntry[];
  },

  async saveTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('time_entries')
      .insert([{
        case_id: entry.caseId,
        client_id: entry.clientId,
        user_id: entry.userId,
        date: entry.date,
        duration_minutes: entry.durationMinutes,
        rate_per_hour: entry.ratePerHour,
        description: entry.description,
        billable: entry.billable,
        billed: entry.billed,
        linked_invoice_id: entry.linkedInvoiceId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInvoiceStatus(id: string, status: Invoice['status']) {
    const { data, error } = await supabase
      .from('billing_invoices')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
