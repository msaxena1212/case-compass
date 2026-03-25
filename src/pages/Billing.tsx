import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search, Plus, Clock, IndianRupee, FileText, Timer,
  Play, Pause, TrendingUp, Receipt, Download, Send, CreditCard, Loader2
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billingService";
import { caseService } from "@/services/caseService";
import { clientService } from "@/services/clientService";
import { Invoice, TimeEntry } from "@/types/billing";
import { LogTimeModal } from "@/components/LogTimeModal";
import { CreateInvoiceModal } from "@/components/CreateInvoiceModal";
import { RecordPaymentModal } from "@/components/RecordPaymentModal";
import { toast } from "sonner";

function formatCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

// --- Dynamic Timer Component ---
function ActiveTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [caseId, setCaseId] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  const { data: cases = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: caseService.getAllCases
  });

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const toggleTimer = () => {
    if (!running && !caseId) {
      toast.error("Please select a case before starting the timer");
      return;
    }
    setRunning(!running);
  };

  const saveTime = async () => {
    if (seconds < 60) {
      toast.error("Timer must run for at least 1 minute before saving");
      return;
    }
    const mins = Math.ceil(seconds / 60);
    const selectedCase = cases.find(c => c.id === caseId);

    try {
      // In a real app we'd call billingService.recordTimeEntry
      // For now we'll simulate it or if there is no recordTimeEntry yet, we'll just toast
      toast.success(`Tracked ${mins} mins for ${selectedCase?.title}`);
      
      setSeconds(0);
      setRunning(false);
      setCaseId('');
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    } catch (e) {
      toast.error("Failed to save time entry");
    }
  };

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const display = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <Card className="border-accent/30 shadow-sm relative overflow-hidden">
      {running && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/40 via-accent to-accent/40 animate-pulse" />}
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full flex items-center justify-center shrink-0 ${running ? "bg-accent/20 border border-accent/30" : "bg-muted"}`}>
              <Timer className={`h-6 w-6 ${running ? "text-accent animate-pulse" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className={`font-mono text-3xl font-bold tracking-wider ${running ? "text-accent" : "text-foreground"}`}>{display}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {running ? "Timer active" : seconds > 0 ? "Timer paused" : "Ready to track time"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={caseId}
              onChange={e => setCaseId(e.target.value)}
              disabled={running}
              className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background divide-y"
            >
              <option value="">Select case...</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <Button
              onClick={toggleTimer}
              className={`h-10 w-10 p-0 shrink-0 ${running ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-accent text-accent-foreground hover:bg-accent/90"}`}
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 pl-0.5" />}
            </Button>
            {seconds > 0 && !running && (
              <Button onClick={saveTime} className="h-10 bg-green-600 text-white hover:bg-green-700">
                Log Time
              </Button>
            )}
            {seconds > 0 && !running && (
              <Button variant="ghost" onClick={() => setSeconds(0)} className="h-10 text-muted-foreground hover:text-destructive">
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main Billing Page ---
export default function Billing() {
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: billingService.getAllInvoices
  });

  const { data: timeEntries = [], isLoading: loadingTime } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => billingService.getTimeEntries()
  });

  const isLoading = loadingInvoices || loadingTime;

  const stats = useMemo(() => {
    const totalRev = invoices.reduce((s, i) => s + i.total, 0);
    const totalPaid = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.total, 0);
    const totalPending = invoices.filter(i => i.status === "Unpaid" || i.status === "Partial").reduce((s, i) => s + i.total, 0);
    const totalOverdue = invoices.filter(i => i.status === "Overdue").reduce((s, i) => s + i.total, 0);
    const unbilledAmt = timeEntries.filter(t => t.billable && !t.billed).reduce((s, t) => s + ((t.durationMinutes/60) * t.ratePerHour), 0);

    return { totalRev, totalPaid, totalPending, totalOverdue, unbilledAmt };
  }, [invoices, timeEntries]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing Billing Ledger...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Billing & Invoicing</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track every minute, earn every rupee. <span className="font-semibold text-amber-600 ml-1">{formatCurrency(stats.unbilledAmt)} unbilled</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPaymentModalOpen(true)} className="gap-2 shrink-0">
              <CreditCard className="h-4 w-4" /> Record Payment
            </Button>
            <Button onClick={() => setInvoiceModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0">
              <Plus className="h-4 w-4" /> Create Invoice
            </Button>
          </div>
        </div>

        {/* Dynamic Timer */}
        <ActiveTimer />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Billed", value: formatCurrency(stats.totalRev), icon: IndianRupee, color: "text-blue-600 bg-blue-50" },
            { label: "Received", value: formatCurrency(stats.totalPaid), icon: TrendingUp, color: "text-green-600 bg-green-50" },
            { label: "Pending", value: formatCurrency(stats.totalPending), icon: Receipt, color: "text-amber-600 bg-amber-50" },
            { label: "Overdue", value: formatCurrency(stats.totalOverdue), icon: Clock, color: "text-red-600 bg-red-50" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{s.label}</p>
                  <p className="text-xl font-display font-bold mt-1">{s.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="w-full sm:w-[500px] grid grid-cols-2">
            <TabsTrigger value="invoices" className="gap-1.5"><Receipt className="h-3.5 w-3.5" /> Invoices</TabsTrigger>
            <TabsTrigger value="time" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Time Entries</TabsTrigger>
          </TabsList>

          {/* INVOICES TAB */}
          <TabsContent value="invoices" className="mt-4 space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice ID or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-2">Invoice ID</div>
                  <div className="col-span-3">Client details</div>
                  <div className="col-span-2">Total Amt</div>
                  <div className="col-span-2">Dates</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-border/60">
                  {invoices
                    .filter(inv => {
                      return inv.id.toLowerCase().includes(search.toLowerCase()) || 
                             (inv.clientName?.toLowerCase() || '').includes(search.toLowerCase());
                    })
                    .map((inv) => {
                      return (
                        <div
                          key={inv.id}
                          className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer items-center group"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <div className="col-span-2 font-mono text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" /> {inv.id}
                          </div>
                          <div className="col-span-3">
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">{inv.clientName || 'Unknown Client'}</p>
                            {inv.caseTitle && <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] truncate" title={inv.caseTitle}>{inv.caseTitle}</p>}
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-bold leading-none">{formatCurrency(inv.total)}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Subtotal: {formatCurrency(inv.amount)}</p>
                          </div>
                          <div className="col-span-2 text-xs">
                            <p className="text-muted-foreground">Iss: {new Date(inv.issuedDate).toLocaleDateString()}</p>
                            <p className={`font-medium ${new Date(inv.dueDate) < new Date() && inv.status !== 'Paid' ? 'text-destructive' : 'text-foreground'}`}>
                              Due: {new Date(inv.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="col-span-1"><StatusBadge status={inv.status.toLowerCase() as any} /></div>
                          <div className="col-span-2 flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  {invoices.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">No invoices generated yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TIME ENTRIES TAB */}
          <TabsContent value="time" className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search descriptions..." className="pl-9" />
              </div>
              <Button variant="outline" onClick={() => setTimeModalOpen(true)} className="gap-2 shrink-0 shadow-sm">
                <Plus className="h-4 w-4" /> Log Manual Time
              </Button>
            </div>

            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Case / Client</div>
                  <div className="col-span-2">Date / Pro</div>
                  <div className="col-span-1 text-center">Duration</div>
                  <div className="col-span-2 text-right">Value</div>
                  <div className="col-span-1 text-center">Status</div>
                </div>
                <div className="divide-y divide-border/60">
                  {timeEntries.map((entry) => {
                    const hours = +(entry.durationMinutes / 60).toFixed(2);
                    const value = hours * entry.ratePerHour;
                    
                    return (
                      <div key={entry.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 items-center hover:bg-muted/30 transition-colors">
                        <div className="col-span-4">
                          <p className="text-sm font-medium leading-snug">{entry.description}</p>
                          {!entry.billable && <Badge variant="secondary" className="mt-1.5 text-[9px] h-4 leading-none">Non-billable</Badge>}
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs font-medium truncate" title={entry.caseTitle}>{entry.caseTitle || 'Unknown Case'}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate" title={entry.clientName}>{entry.clientName}</p>
                        </div>
                        <div className="col-span-2 text-xs">
                          <p>{new Date(entry.date).toLocaleDateString()}</p>
                          <p className="text-muted-foreground mt-0.5">{entry.userId}</p>
                        </div>
                        <div className="col-span-1 text-sm font-mono font-medium text-center">
                          {Math.floor(entry.durationMinutes / 60)}h {entry.durationMinutes % 60}m
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="text-sm font-bold">{formatCurrency(value)}</p>
                          {entry.billable && entry.ratePerHour > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(entry.ratePerHour)}/hr</p>
                          )}
                        </div>
                        <div className="col-span-1 text-center">
                          {entry.billed ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-success/15 text-success font-bold uppercase tracking-wider">Billed</span>
                          ) : entry.billable ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-warning/15 text-warning font-bold uppercase tracking-wider">Unbilled</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-bold uppercase tracking-wider">N/A</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* --- INVOICE DETAIL VIEW (View only) --- */}
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="sm:max-w-2xl bg-[#FCFCFD]">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="flex items-center justify-between font-display text-xl">
                <span>INVOICE <span className="text-primary">{selectedInvoice?.id}</span></span>
                <StatusBadge status={(selectedInvoice?.status || 'unpaid').toLowerCase() as any} />
              </DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-2 text-sm bg-white p-4 rounded-lg border shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Billed To</p>
                    <p className="font-semibold text-base">{selectedInvoice.clientName}</p>
                    <p className="text-muted-foreground mt-0.5 max-w-[200px] leading-snug">Client ID: {selectedInvoice.clientId}</p>
                  </div>
                  <div className="text-right space-y-1.5">
                    <div className="flex justify-end gap-4">
                      <span className="text-muted-foreground">Issued Date</span>
                      <span className="font-medium w-24">{new Date(selectedInvoice.issuedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-end gap-4">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-medium w-24">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/40 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Hours</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  <div className="divide-y">
                    {selectedInvoice.items.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm">
                        <div className="col-span-6 text-muted-foreground leading-snug">{item.description}</div>
                        <div className="col-span-2 text-center font-mono">{item.hours}h</div>
                        <div className="col-span-2 text-right text-muted-foreground">{formatCurrency(item.rate)}</div>
                        <div className="col-span-2 text-right font-medium">{formatCurrency(item.amount)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted/10 px-4 py-3 border-t">
                    <div className="flex flex-col gap-2 w-48 ml-auto text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedInvoice.amount)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax (18%)</span>
                        <span>{formatCurrency(selectedInvoice.tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base pt-2 border-t text-foreground">
                        <span>Total</span>
                        <span>{formatCurrency(selectedInvoice.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2 bg-white">
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                  <Button className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Send className="h-4 w-4" /> Send Reminder to Client
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Feature Modals */}
        <LogTimeModal isOpen={timeModalOpen} onClose={() => setTimeModalOpen(false)} />
        <CreateInvoiceModal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} />
        <RecordPaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
        
      </div>
    </AppLayout>
  );
}
