import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billingService";
import { clientService } from "@/services/clientService";
import { caseService } from "@/services/caseService";
import { Invoice, InvoiceItem } from "@/types/billing";
import { toast } from "sonner";
import { FileText, IndianRupee, Loader2 } from "lucide-react";

type CreateInvoiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
  const [clientId, setClientId] = useState('');
  const [caseId, setCaseId] = useState('');
  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getAllClients,
    enabled: isOpen
  });

  // Fetch cases for selected client
  const { data: cases = [] } = useQuery({
    queryKey: ['cases', clientId],
    queryFn: caseService.getAllCases,
    enabled: isOpen && !!clientId
  });

  // Fetch unbilled time entries
  const { data: allTimeEntries = [], isLoading: loadingTime } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => billingService.getTimeEntries(),
    enabled: isOpen
  });

  const unbilledEntries = useMemo(() => {
    return allTimeEntries.filter(t => 
      t.billable && 
      !t.billed &&
      (clientId ? t.clientId === clientId : true) &&
      (caseId ? t.caseId === caseId : true)
    );
  }, [allTimeEntries, clientId, caseId]);

  const calculateTotal = () => {
    return unbilledEntries.reduce((sum, t) => {
      const hours = t.durationMinutes / 60;
      return sum + (hours * t.ratePerHour);
    }, 0);
  };

  const mutation = useMutation({
    mutationFn: (newInvoice: any) => billingService.createInvoice(newInvoice),
    onSuccess: (data) => {
      toast.success(`Invoice generated successfully`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setClientId('');
      setCaseId('');
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
    if (unbilledEntries.length === 0) {
      toast.error('No unbilled time entries found for this selection');
      return;
    }

    const subtotal = calculateTotal();
    const tax = subtotal * 0.18; // 18% GST

    const items: InvoiceItem[] = unbilledEntries.map(t => ({
      description: t.description,
      hours: +(t.durationMinutes / 60).toFixed(2),
      rate: t.ratePerHour,
      amount: +((t.durationMinutes / 60) * t.ratePerHour).toFixed(2)
    }));

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

          {clientId && (
            <div className="bg-muted/50 rounded-lg p-4 border mt-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" /> Invoice Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unbilled Entries Found</span>
                  <span className="font-mono">
                    {loadingTime ? <Loader2 className="h-3 w-3 animate-spin inline" /> : unbilledEntries.length} items
                  </span>
                </div>
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
            <Button type="submit" disabled={mutation.isPending || !clientId || unbilledEntries.length === 0}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
