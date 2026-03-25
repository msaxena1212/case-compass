import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billingService";
import { Payment, PaymentMode } from "@/types/billing";
import { toast } from "sonner";
import { IndianRupee, Loader2 } from "lucide-react";

type RecordPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  invoiceId?: string;
  onSuccess?: () => void;
};

export function RecordPaymentModal({ isOpen, onClose, invoiceId: defaultInvoiceId, onSuccess }: RecordPaymentModalProps) {
  const [invoiceId, setInvoiceId] = useState(defaultInvoiceId || '');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<PaymentMode>('Bank Transfer');
  const [refNum, setRefNum] = useState('');
  const queryClient = useQueryClient();

  // Fetch all invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: billingService.getAllInvoices,
    enabled: isOpen
  });

  // Fetch all payments to calculate balances
  const { data: allPayments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => billingService.getAllPayments(),
    enabled: isOpen
  });

  const eligibleInvoices = useMemo(() => 
    invoices.filter(inv => inv.status !== 'Paid'),
    [invoices]
  );
  
  const selectedInvoice = useMemo(() => 
    invoices.find(inv => inv.id === invoiceId),
    [invoices, invoiceId]
  );

  const getRemainingBalance = (invId: string) => {
    const inv = invoices.find(i => i.id === invId);
    if (!inv) return 0;
    const paidSoFar = allPayments.filter(p => p.invoiceId === invId).reduce((sum, p) => sum + p.amount, 0);
    return inv.total - paidSoFar;
  };

  const mutation = useMutation({
    mutationFn: (newPayment: Omit<Payment, 'id'>) => 
      billingService.recordPayment(newPayment),
    onSuccess: () => {
      toast.success(`Payment recorded successfully`);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setInvoiceId('');
      setAmount('');
      setRefNum('');
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoiceId) {
      toast.error('Please select an invoice');
      return;
    }

    const payAmount = parseFloat(amount);
    if (payAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    const remaining = getRemainingBalance(invoiceId);
    if (payAmount > remaining + 0.01) { // allow small float diff
      toast.error(`Amount exceeds remaining balance of ₹${remaining.toLocaleString()}`);
      return;
    }

    mutation.mutate({
      invoiceId,
      amount: payAmount,
      date: new Date().toISOString(),
      mode,
      referenceNumber: refNum
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" /> Record Payment
          </DialogTitle>
          <DialogDescription>
            Log a partial or full payment against an open invoice.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Invoice *</Label>
            <select 
              value={invoiceId}
              onChange={e => {
                setInvoiceId(e.target.value);
                setAmount(getRemainingBalance(e.target.value).toString()); // Auto-fill remaining
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Choose an open invoice...</option>
              {eligibleInvoices.map(inv => {
                const bal = getRemainingBalance(inv.id);
                return (
                  <option key={inv.id} value={inv.id}>
                    {inv.id} (Balance: ₹{bal.toLocaleString()})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Amount Received (₹) *</Label>
            <Input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            {selectedInvoice && (
              <p className="text-[10px] text-muted-foreground">
                Remaining balance before this payment: ₹{getRemainingBalance(selectedInvoice.id).toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <select 
              value={mode}
              onChange={e => setMode(e.target.value as PaymentMode)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background divide-y"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash / Cheque</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Reference Number / UTR</Label>
            <Input 
              value={refNum}
              onChange={e => setRefNum(e.target.value)}
              placeholder="e.g. HDFC123456789X"
            />
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !invoiceId}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
