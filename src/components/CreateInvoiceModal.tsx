import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billingService";
import { clientService } from "@/services/clientService";
import { caseService } from "@/services/caseService";
import { Invoice, InvoiceItem } from "@/types/billing";
import { toast } from "sonner";
import { FileText, IndianRupee, Loader2, Plus, Trash2 } from "lucide-react";

type CreateInvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
  const [clientId, setClientId] = useState('');
  const [caseId, setCaseId] = useState('');
  const [notes, setNotes] = useState('');
  
  // Misc Items State
  const [miscItems, setMiscItems] = useState<{type: string, description: string, amount: number}[]>([]);
  const [miscType, setMiscType] = useState('Travel');
  const [miscDesc, setMiscDesc] = useState('');
  const [miscAmount, setMiscAmount] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clientsResponse } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAllClients(1, 1000),
    enabled: isOpen
  });
  const clients = clientsResponse?.data || [];

  // Fetch cases for selected client
  const { data: casesResponse } = useQuery({
    queryKey: ['cases', clientId],
    queryFn: () => caseService.getAllCases(1, 1000),
    enabled: isOpen && !!clientId
  });
  const cases = casesResponse?.data || [];

  // Fetch unbilled time entries
  const { data: allTimeEntriesResponse, isLoading: loadingTime } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => billingService.getTimeEntries(),
    enabled: isOpen
  });
  const allTimeEntries = allTimeEntriesResponse?.data || [];

  const unbilledEntries = useMemo(() => {
    return allTimeEntries.filter(t => 
      t.billable && 
      !t.billed &&
      (clientId ? t.clientId === clientId : true) &&
      (caseId ? t.caseId === caseId : true)
    );
  }, [allTimeEntries, clientId, caseId]);

  const calculateTotal = () => {
    const timeTotal = unbilledEntries.reduce((sum, t) => {
      const hours = t.durationMinutes / 60;
      return sum + (hours * t.ratePerHour);
    }, 0);
    const miscTotal = miscItems.reduce((sum, item) => sum + item.amount, 0);
    return timeTotal + miscTotal;
  };

  const handleAddMisc = () => {
    if (!miscDesc || !miscAmount) return;
    setMiscItems(prev => [...prev, { type: miscType, description: miscDesc, amount: Number(miscAmount) }]);
    setMiscDesc('');
    setMiscAmount('');
  };

  const removeMiscItem = (index: number) => {
    setMiscItems(prev => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: (newInvoice: any) => billingService.createInvoice(newInvoice),
    onSuccess: (data) => {
      toast.success(`Invoice generated successfully`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-lookup'] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setClientId('');
      setCaseId('');
      setNotes('');
      setMiscItems([]);
      setMiscType('Travel');
      setMiscDesc('');
      setMiscAmount('');
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) {
      toast.error('Please select a client');
      return;
    }
    if (unbilledEntries.length === 0 && miscItems.length === 0) {
      toast.error('No billable items found for this invoice');
      return;
    }

    const subtotal = calculateTotal();
    const tax = subtotal * 0.18; // 18% GST

    const timeItems: InvoiceItem[] = unbilledEntries.map(t => ({
      description: t.description,
      hours: +(t.durationMinutes / 60).toFixed(2),
      rate: t.ratePerHour,
      amount: +((t.durationMinutes / 60) * t.ratePerHour).toFixed(2)
    }));
    
    const miscInvoiceItems: InvoiceItem[] = miscItems.map(m => ({
      description: `[${m.type}] ${m.description}`,
      hours: 1, // Treat as a flat fee
      rate: m.amount,
      amount: m.amount
    }));

    const items = [...timeItems, ...miscInvoiceItems];

    mutation.mutate({
      clientId,
      caseId: caseId || null,
      amount: subtotal,
      tax,
      total: subtotal + tax,
      issuedDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Unpaid',
      items,
      notes,
      timeEntryIds: unbilledEntries.map(t => t.id) // Pass this so service can update time_entries
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Generate Invoice
          </DialogTitle>
          <DialogDescription>
            Auto-generate an invoice by fetching all unbilled time entries for a client.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Client *</Label>
            <select 
              value={clientId}
              onChange={e => {
                setClientId(e.target.value);
                setCaseId(''); // reset case
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Choose a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Select Case (Optional - For case-specific invoice)</Label>
            <select 
              value={caseId}
              onChange={e => setCaseId(e.target.value)}
              disabled={!clientId}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background divide-y"
            >
              <option value="">All active cases for this client</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Description / Internal Notes</Label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any internal comments or description for this invoice..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Miscellaneous Items Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm">Additional Charges</h4>
            <div className="flex items-end gap-2">
              <div className="space-y-1 w-1/4">
                <Label className="text-xs">Category</Label>
                <select 
                  value={miscType}
                  onChange={e => setMiscType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option>Travel</option>
                  <option>Court Fees</option>
                  <option>Documentation</option>
                  <option>Consultation</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Description</Label>
                <Input 
                  placeholder="e.g. Flight to Delhi" 
                  value={miscDesc} 
                  onChange={e => setMiscDesc(e.target.value)} 
                  className="h-9" 
                />
              </div>
              <div className="space-y-1 w-[100px]">
                <Label className="text-xs">Amount</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={miscAmount} 
                  onChange={e => setMiscAmount(e.target.value)} 
                  className="h-9" 
                />
              </div>
              <Button type="button" onClick={handleAddMisc} size="sm" variant="secondary" className="h-9 px-3 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {miscItems.length > 0 && (
              <div className="bg-muted/30 rounded-md border p-2 space-y-2">
                {miscItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-background p-2 rounded border shadow-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">{item.type}</span>
                      <span className="truncate">{item.description}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 pl-2">
                      <span className="font-mono font-medium">₹{item.amount.toLocaleString()}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeMiscItem(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {clientId && (
            <div className="bg-muted/50 rounded-lg p-4 border mt-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" /> Invoice Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unbilled Time Found</span>
                  <span className="font-mono">
                    {loadingTime ? <Loader2 className="h-3 w-3 animate-spin inline" /> : unbilledEntries.length} items
                  </span>
                </div>
                {miscItems.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Additional Charges</span>
                    <span className="font-mono">{miscItems.length} items</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Billable Hours</span>
                  <span className="font-mono">{(unbilledEntries.reduce((s, t) => s + t.durationMinutes, 0) / 60).toFixed(1)}h</span>
                </div>
                <div className="pt-2 mt-2 border-t flex justify-between font-bold">
                  <span>Estimated Total (excl. Tax)</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !clientId || (unbilledEntries.length === 0 && miscItems.length === 0)}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
