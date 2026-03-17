import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Plus, Clock, IndianRupee, FileText, Timer,
  Play, Pause, TrendingUp, Receipt, Download, Send
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// --- Time Entries ---
interface TimeEntry {
  id: string;
  case: string;
  caseId: string;
  description: string;
  lawyer: string;
  date: string;
  hours: number;
  rate: number;
  billable: boolean;
  billed: boolean;
}

const timeEntries: TimeEntry[] = [
  { id: "T-001", case: "Sharma vs. State", caseId: "C-2024-0847", description: "Court hearing preparation", lawyer: "Adv. Kumar", date: "Mar 15, 2026", hours: 3.5, rate: 5000, billable: true, billed: false },
  { id: "T-002", case: "Sharma vs. State", caseId: "C-2024-0847", description: "Witness interview", lawyer: "Adv. Kumar", date: "Mar 14, 2026", hours: 2.0, rate: 5000, billable: true, billed: false },
  { id: "T-003", case: "Patel Industries Merger", caseId: "C-2024-0846", description: "Due diligence review", lawyer: "Adv. Mehta", date: "Mar 14, 2026", hours: 5.0, rate: 7500, billable: true, billed: true },
  { id: "T-004", case: "Patel Industries Merger", caseId: "C-2024-0846", description: "Board meeting attendance", lawyer: "Adv. Mehta", date: "Mar 13, 2026", hours: 2.5, rate: 7500, billable: true, billed: true },
  { id: "T-005", case: "Singh Property Dispute", caseId: "C-2024-0845", description: "Site inspection", lawyer: "Adv. Kumar", date: "Mar 12, 2026", hours: 4.0, rate: 5000, billable: true, billed: false },
  { id: "T-006", case: "Gupta vs. Gupta", caseId: "C-2024-0844", description: "Mediation session", lawyer: "Adv. Joshi", date: "Mar 11, 2026", hours: 3.0, rate: 4000, billable: true, billed: false },
  { id: "T-007", case: "Tech Solutions IP", caseId: "C-2024-0843", description: "Legal research", lawyer: "Adv. Kumar", date: "Mar 10, 2026", hours: 6.0, rate: 5000, billable: true, billed: false },
  { id: "T-008", case: "Internal", caseId: "-", description: "Team meeting", lawyer: "Adv. Kumar", date: "Mar 10, 2026", hours: 1.0, rate: 5000, billable: false, billed: false },
];

// --- Invoices ---
interface Invoice {
  id: string;
  client: string;
  case: string;
  caseId: string;
  amount: number;
  tax: number;
  total: number;
  issued: string;
  due: string;
  status: "paid" | "unpaid" | "overdue";
  items: { description: string; hours: number; rate: number; amount: number }[];
}

const invoicesData: Invoice[] = [
  {
    id: "INV-2026-041", client: "Patel Industries", case: "Patel Industries Merger", caseId: "C-2024-0846",
    amount: 56250, tax: 10125, total: 66375, issued: "Mar 1, 2026", due: "Mar 31, 2026", status: "paid",
    items: [
      { description: "Due diligence review", hours: 5.0, rate: 7500, amount: 37500 },
      { description: "Board meeting attendance", hours: 2.5, rate: 7500, amount: 18750 },
    ],
  },
  {
    id: "INV-2026-040", client: "Rajesh Sharma", case: "Sharma vs. State", caseId: "C-2024-0847",
    amount: 27500, tax: 4950, total: 32450, issued: "Feb 28, 2026", due: "Mar 28, 2026", status: "unpaid",
    items: [
      { description: "Court hearing preparation", hours: 3.5, rate: 5000, amount: 17500 },
      { description: "Witness interview", hours: 2.0, rate: 5000, amount: 10000 },
    ],
  },
  {
    id: "INV-2026-039", client: "Harpreet Singh", case: "Singh Property Dispute", caseId: "C-2024-0845",
    amount: 20000, tax: 3600, total: 23600, issued: "Feb 15, 2026", due: "Feb 28, 2026", status: "overdue",
    items: [
      { description: "Site inspection", hours: 4.0, rate: 5000, amount: 20000 },
    ],
  },
  {
    id: "INV-2026-038", client: "Anita Gupta", case: "Gupta vs. Gupta", caseId: "C-2024-0844",
    amount: 12000, tax: 2160, total: 14160, issued: "Feb 10, 2026", due: "Mar 10, 2026", status: "paid",
    items: [
      { description: "Mediation session", hours: 3.0, rate: 4000, amount: 12000 },
    ],
  },
  {
    id: "INV-2026-037", client: "Tech Solutions Pvt Ltd", case: "Tech Solutions IP", caseId: "C-2024-0843",
    amount: 30000, tax: 5400, total: 35400, issued: "Feb 5, 2026", due: "Mar 5, 2026", status: "overdue",
    items: [
      { description: "Legal research", hours: 6.0, rate: 5000, amount: 30000 },
    ],
  },
];

function formatCurrency(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

// --- Timer Component ---
function ActiveTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const display = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <Card className="border-accent/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${running ? "bg-destructive/10" : "bg-accent/10"}`}>
              <Timer className={`h-5 w-5 ${running ? "text-destructive animate-pulse" : "text-accent"}`} />
            </div>
            <div>
              <p className="font-mono text-2xl font-bold tracking-wider">{display}</p>
              <p className="text-xs text-muted-foreground">
                {running ? "Timer running" : seconds > 0 ? "Timer paused" : "Start tracking time"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select>
              <SelectTrigger className="w-40 text-xs h-8">
                <SelectValue placeholder="Select case..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C-2024-0847">Sharma vs. State</SelectItem>
                <SelectItem value="C-2024-0846">Patel Merger</SelectItem>
                <SelectItem value="C-2024-0845">Singh Property</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => setRunning(!running)}
              className={running ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-accent text-accent-foreground hover:bg-accent/90"}
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {seconds > 0 && !running && (
              <Button size="sm" variant="outline" onClick={() => setSeconds(0)}>
                Save
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Billing() {
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const totalRevenue = invoicesData.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoicesData.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalPending = invoicesData.filter((i) => i.status === "unpaid").reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoicesData.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const totalBillableHours = timeEntries.filter((t) => t.billable).reduce((s, t) => s + t.hours, 0);
  const unbilledHours = timeEntries.filter((t) => t.billable && !t.billed).reduce((s, t) => s + t.hours, 0);

  const stats = [
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: IndianRupee, color: "text-accent" },
    { label: "Paid", value: formatCurrency(totalPaid), icon: TrendingUp, color: "text-success" },
    { label: "Pending", value: formatCurrency(totalPending), icon: Receipt, color: "text-warning" },
    { label: "Overdue", value: formatCurrency(totalOverdue), icon: Clock, color: "text-destructive" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Billing & Invoicing</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalBillableHours}h billable · {unbilledHours}h unbilled
            </p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0">
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <p className="text-xl font-bold mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timer */}
        <ActiveTimer />

        {/* Tabs */}
        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices" className="gap-1.5"><Receipt className="h-3.5 w-3.5" /> Invoices</TabsTrigger>
            <TabsTrigger value="time" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Time Entries</TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-2">Invoice</div>
                  <div className="col-span-3">Client / Case</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Issued</div>
                  <div className="col-span-1">Due</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Actions</div>
                </div>
                <div className="divide-y">
                  {invoicesData
                    .filter((inv) => inv.client.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase()))
                    .map((inv) => (
                      <div
                        key={inv.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer items-center"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <div className="col-span-2 font-mono text-sm font-medium">{inv.id}</div>
                        <div className="col-span-3">
                          <p className="text-sm font-medium">{inv.client}</p>
                          <p className="text-xs text-muted-foreground">{inv.case}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-bold">{formatCurrency(inv.total)}</p>
                          <p className="text-xs text-muted-foreground">incl. tax {formatCurrency(inv.tax)}</p>
                        </div>
                        <div className="col-span-2 text-xs text-muted-foreground">{inv.issued}</div>
                        <div className="col-span-1 text-xs">{inv.due}</div>
                        <div className="col-span-1"><StatusBadge status={inv.status} /></div>
                        <div className="col-span-1 flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Entries Tab */}
          <TabsContent value="time" className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search time entries..." className="pl-9" />
              </div>
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Manual Entry
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Case</div>
                  <div className="col-span-2">Lawyer</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-1">Hours</div>
                  <div className="col-span-1">Rate</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-1">Status</div>
                </div>
                <div className="divide-y">
                  {timeEntries.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-muted/30 transition-colors items-center">
                      <div className="col-span-3">
                        <p className="text-sm font-medium">{entry.description}</p>
                        {!entry.billable && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Non-billable</span>}
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm">{entry.case}</p>
                        <p className="text-xs text-muted-foreground font-mono">{entry.caseId}</p>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">{entry.lawyer}</div>
                      <div className="col-span-1 text-xs">{entry.date}</div>
                      <div className="col-span-1 text-sm font-mono font-medium">{entry.hours}h</div>
                      <div className="col-span-1 text-xs text-muted-foreground">{formatCurrency(entry.rate)}/h</div>
                      <div className="col-span-1 text-sm font-medium">{formatCurrency(entry.hours * entry.rate)}</div>
                      <div className="col-span-1">
                        {entry.billed ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">Billed</span>
                        ) : entry.billable ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/15 text-warning font-medium">Unbilled</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">N/A</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Invoice Detail Dialog */}
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-accent" />
                {selectedInvoice?.id}
              </DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Client</p>
                    <p className="font-medium">{selectedInvoice.client}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Issued</p>
                    <p>{selectedInvoice.issued}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Due</p>
                    <p>{selectedInvoice.due}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Line Items</p>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 text-xs text-muted-foreground font-medium">
                      <div className="col-span-5">Description</div>
                      <div className="col-span-2">Hours</div>
                      <div className="col-span-2">Rate</div>
                      <div className="col-span-3 text-right">Amount</div>
                    </div>
                    {selectedInvoice.items.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2.5 border-t text-sm">
                        <div className="col-span-5">{item.description}</div>
                        <div className="col-span-2 font-mono">{item.hours}h</div>
                        <div className="col-span-2 text-muted-foreground">{formatCurrency(item.rate)}</div>
                        <div className="col-span-3 text-right font-medium">{formatCurrency(item.amount)}</div>
                      </div>
                    ))}
                    <div className="border-t bg-muted/30 px-3 py-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(selectedInvoice.amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">GST (18%)</span>
                        <span>{formatCurrency(selectedInvoice.tax)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-1 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(selectedInvoice.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                  <Button className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Send className="h-4 w-4" /> Send to Client
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
