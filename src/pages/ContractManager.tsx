import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CreateContractModal } from "@/components/CreateContractModal";
import { ContractDetailSidebar } from "@/components/ContractDetailSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mockContracts } from "@/store/mockData";
import { Contract, ContractStatus } from "@/types/contract";
import {
  Plus, Search, FileText, AlertTriangle, CheckCircle2,
  Clock, PenLine, Send, FileSignature, Filter, Scale
} from "lucide-react";

const STATUS_CONFIG: Record<ContractStatus, { color: string; icon: React.ElementType }> = {
  'Draft':           { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: PenLine },
  'Internal Review': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Search },
  'AI Risk Analysis':{ color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Scale },
  'Pending Approval':{ color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  'Approved':        { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  'Sent for Signing':{ color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Send },
  'Signed':          { color: 'bg-green-50 text-green-700 border-green-200', icon: FileSignature },
  'Expired':         { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle },
  'Terminated':      { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: AlertTriangle },
};

function formatINR(v?: number) {
  if (!v) return null;
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${(v / 1000).toFixed(0)}K`;
}

const PIPELINE_STAGES: ContractStatus[] = [
  'Draft', 'Internal Review', 'Pending Approval', 'Sent for Signing', 'Signed'
];

export default function ContractManager() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [search, setSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ContractStatus | 'All'>('All');

  const filtered = contracts.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.parties.partyA.toLowerCase().includes(search.toLowerCase()) ||
      c.parties.partyB.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (id: string, status: Contract['status']) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (selectedContract?.id === id) {
      setSelectedContract(prev => prev ? { ...prev, status } : null);
    }
  };

  const totalValue = contracts.reduce((s, c) => s + (c.value || 0), 0);
  const highRisk = contracts.filter(c => c.riskScore >= 60).length;
  const expiringSoon = contracts.filter(c => {
    if (!c.expiryDate) return false;
    const daysLeft = (new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft <= 30;
  }).length;

  return (
    <AppLayout>
      <div className={`flex gap-6 transition-all ${selectedContract ? 'pr-0' : ''}`}>
        {/* Main Content */}
        <div className={`flex-1 min-w-0 space-y-6 transition-all ${selectedContract ? 'max-w-[calc(100%-380px)]' : ''}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-semibold tracking-tight">Contract Lifecycle Manager</h1>
              <p className="text-sm text-muted-foreground mt-1">Draft → Review → Approve → Sign — all in one place.</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shrink-0">
              <Plus className="h-4 w-4" /> New Contract
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Contracts', value: contracts.length, color: 'text-foreground' },
              { label: 'Total Value', value: formatINR(totalValue) || '₹0', color: 'text-accent' },
              { label: 'High Risk', value: highRisk, color: 'text-red-600' },
              { label: 'Expiring (30d)', value: expiringSoon, color: 'text-amber-600' },
            ].map(s => (
              <Card key={s.label} className="border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className={`text-2xl font-display font-bold mt-1 ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pipeline Bar */}
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-3">Contract Pipeline</p>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
              {PIPELINE_STAGES.map((stage, i) => {
                const count = contracts.filter(c => c.status === stage).length;
                const config = STATUS_CONFIG[stage];
                return (
                  <div key={stage} className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setFilterStatus(filterStatus === stage ? 'All' : stage)}
                      className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${filterStatus === stage ? config.color + ' shadow-sm' : 'bg-muted/30 border-border/40 text-muted-foreground hover:border-accent/30'}`}
                    >
                      <config.icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{stage}</span>
                      <span className="font-black">{count}</span>
                    </button>
                    {i < PIPELINE_STAGES.length - 1 && <div className="w-4 h-0.5 bg-border/40 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contracts, parties..."
              className="pl-9"
            />
          </div>

          {/* Contracts List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="py-16 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center">
                <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-semibold">No contracts found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or create a new contract.</p>
              </div>
            ) : (
              filtered.map(c => {
                const config = STATUS_CONFIG[c.status] || STATUS_CONFIG['Draft'];
                const aiIssues = c.clauses.filter(cl => cl.aiFlag).length;
                const pendingAppr = c.approvals.filter(a => a.status === 'Pending').length;
                const daysToExpiry = c.expiryDate ? Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

                return (
                  <Card
                    key={c.id}
                    className={`group cursor-pointer hover:shadow-md transition-all border-l-4 ${
                      selectedContract?.id === c.id ? 'border-l-accent shadow-md' : 'border-l-transparent hover:border-l-accent/40'
                    }`}
                    onClick={() => setSelectedContract(selectedContract?.id === c.id ? null : c)}
                  >
                    <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-xl">
                        {c.type === 'NDA' ? '🔒' : c.type === 'Service Agreement' ? '⚙️' : c.type === 'Employment Contract' ? '🧑‍💼' : c.type === 'Lease Agreement' ? '🏢' : '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2 mb-1">
                          <h3 className="text-sm font-bold leading-tight flex-1 min-w-0 truncate">{c.title}</h3>
                          <Badge className={`text-[9px] font-black uppercase tracking-widest border px-1.5 h-5 shrink-0 ${config.color}`}>
                            {c.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 truncate">
                          {c.parties.partyA} <span className="opacity-40 mx-1">⟺</span> {c.parties.partyB}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[10px]">
                          {formatINR(c.value) && <span className="font-bold text-accent">{formatINR(c.value)}</span>}
                          <span className={`font-bold ${c.riskScore >= 60 ? 'text-red-600' : c.riskScore >= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {c.riskScore}% Risk
                          </span>
                          {aiIssues > 0 && <span className="text-amber-600 font-bold flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" /> {aiIssues} AI Flag{aiIssues > 1 ? 's' : ''}</span>}
                          {pendingAppr > 0 && <span className="text-blue-600 font-bold flex items-center gap-0.5"><Clock className="h-3 w-3" /> {pendingAppr} Pending</span>}
                          {daysToExpiry !== null && daysToExpiry <= 60 && daysToExpiry > 0 && (
                            <span className={`font-bold flex items-center gap-0.5 ${daysToExpiry <= 30 ? 'text-red-600' : 'text-amber-600'}`}>
                              <AlertTriangle className="h-3 w-3" /> Expires in {daysToExpiry}d
                            </span>
                          )}
                          <span className="text-muted-foreground ml-auto">v{c.version} · {new Date(c.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Sidebar */}
        {selectedContract && (
          <div className="w-[380px] shrink-0 sticky top-0 h-[calc(100vh-3.5rem)] overflow-hidden rounded-xl border border-border/60 shadow-xl">
            <ContractDetailSidebar
              contract={selectedContract}
              onClose={() => setSelectedContract(null)}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>

      <CreateContractModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(c) => { setContracts([c, ...contracts]); setSelectedContract(c); }}
      />
    </AppLayout>
  );
}
