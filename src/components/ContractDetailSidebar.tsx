import { useState } from "react";
import { Contract, ContractClause, ContractApproval } from "@/types/contract";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X, AlertTriangle, CheckCircle2, Clock, Send, PenLine,
  ShieldCheck, FileSignature, AlertCircle, Sparkles, XCircle
} from "lucide-react";
import { toast } from "sonner";

interface ContractDetailSidebarProps {
  contract: Contract | null;
  onClose: () => void;
  onStatusChange: (id: string, status: Contract['status']) => void;
}

const RISK_COLORS: Record<string, string> = {
  Low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-600 bg-amber-50 border-amber-200',
  High: 'text-red-600 bg-red-50 border-red-200',
  Critical: 'text-red-900 bg-red-100 border-red-300'
};

const STATUS_FLOW: Contract['status'][] = [
  'Draft', 'Internal Review', 'AI Risk Analysis', 'Pending Approval',
  'Approved', 'Sent for Signing', 'Signed'
];

const riskLabel = (score: number) => {
  if (score < 30) return { label: 'Low Risk', color: 'text-emerald-600' };
  if (score < 60) return { label: 'Medium Risk', color: 'text-amber-600' };
  if (score < 80) return { label: 'High Risk', color: 'text-red-600' };
  return { label: 'Critical Risk', color: 'text-red-900' };
};

export function ContractDetailSidebar({ contract, onClose, onStatusChange }: ContractDetailSidebarProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!contract) return null;

  const risk = riskLabel(contract.riskScore);
  const aiFlags = contract.clauses.filter(c => c.aiFlag);
  const pendingApprovals = contract.approvals.filter(a => a.status === 'Pending');
  const currentStepIdx = STATUS_FLOW.indexOf(contract.status);
  const nextStatus = currentStepIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentStepIdx + 1] : null;

  const handleRunAIAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onStatusChange(contract.id, 'AI Risk Analysis');
      toast.success(`AI analysis complete. ${aiFlags.length} clause issue(s) flagged.`);
    }, 2000);
  };

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    onStatusChange(contract.id, nextStatus);
    if (nextStatus === 'Sent for Signing') {
      toast.success('E-signature request sent to all parties via email.');
    } else {
      toast.success(`Contract moved to: ${nextStatus}`);
    }
  };

  const formatValue = (v?: number) => v ? `₹${(v / 100000).toFixed(1)}L` : 'N/A';

  return (
    <div className="h-full flex flex-col bg-white border-l border-border/60 shadow-xl">
      {/* Header */}
      <div className="p-5 border-b bg-gradient-to-br from-accent/5 to-transparent shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge className={`text-[9px] font-black uppercase tracking-widest mb-2 h-5 px-2 ${
              contract.status === 'Signed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              contract.status === 'Sent for Signing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              contract.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700 border-amber-200' :
              'bg-muted text-muted-foreground border-border'
            } border`}>
              {contract.status}
            </Badge>
            <h3 className="text-sm font-bold leading-snug">{contract.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{contract.type} · v{contract.version}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Risk Meter */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Risk Score</span>
            <span className={`text-xs font-black ${risk.color}`}>{contract.riskScore}/100 — {risk.label}</span>
          </div>
          <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${contract.riskScore < 30 ? 'bg-emerald-500' : contract.riskScore < 60 ? 'bg-amber-400' : 'bg-red-500'}`}
              style={{ width: `${contract.riskScore}%` }}
            />
          </div>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          {[
            { label: 'Value', val: formatValue(contract.value) },
            { label: 'Clauses', val: contract.clauses.length },
            { label: 'Approvals', val: `${contract.approvals.filter(a => a.status === 'Approved').length}/${contract.approvals.length}` },
          ].map(item => (
            <div key={item.label} className="bg-muted/30 rounded-lg p-2 border border-border/40">
              <p className="text-[10px] text-muted-foreground font-bold">{item.label}</p>
              <p className="text-sm font-bold mt-0.5">{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="clauses" className="h-full">
          <TabsList className="w-full rounded-none border-b bg-muted/20 p-0 h-10">
            <TabsTrigger value="clauses" className="flex-1 rounded-none h-10 text-xs font-bold data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent">Clauses</TabsTrigger>
            <TabsTrigger value="approvals" className="flex-1 rounded-none h-10 text-xs font-bold data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent">Approvals</TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 rounded-none h-10 text-xs font-bold data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="clauses" className="m-0 p-4 space-y-3">
            {(contract.clauses.length === 0 ? [
              { id: 'sample_1', title: 'Jurisdiction & Governing Law', content: 'This agreement shall be governed by and construed in accordance with the laws of India. The courts at Bengaluru shall have exclusive jurisdiction.', riskLevel: 'Low', isCustom: false },
              { id: 'sample_2', title: 'Professional Indemnity', content: 'The Service Provider shall maintain professional indemnity insurance or equivalent for an amount not less than ₹50,00,000.', riskLevel: 'Medium', isCustom: false, aiFlag: 'Coverage amount verification recommended.' },
              { id: 'sample_3', title: 'Intellectual Property Rights', content: 'All work product created under this agreement shall be the exclusive property of the Client upon full payment of fees.', riskLevel: 'Low', isCustom: true }
            ] : contract.clauses).map(clause => (
              <div key={clause.id} className="p-3.5 border rounded-xl bg-white hover:bg-muted/10 transition-colors group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-xs font-bold">{clause.title}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${RISK_COLORS[clause.riskLevel]}`}>
                      {clause.riskLevel} Risk
                    </span>
                    {clause.isCustom && <span className="ml-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Custom</span>}
                  </div>
                </div>
                {clause.aiFlag && (
                  <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-100 text-[10px] text-amber-800 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" /> {clause.aiFlag}
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 line-clamp-3 group-hover:line-clamp-none transition-all">{clause.content}</p>
              </div>
            ))}
          </TabsContent>

          {/* Approvals Tab */}
          {/* Approvals Tab */}
          <TabsContent value="approvals" className="m-0 p-4 space-y-3">
            {(contract.approvals.length === 0 ? [
              { id: 'appr_1', approverName: 'Adv. Kumar', role: 'Principle Partner', status: 'Approved', actionedAt: new Date(Date.now() - 86400000).toISOString(), comment: 'Contract terms look solid and compliant.' },
              { id: 'appr_2', approverName: 'Compliance Officer', role: 'Risk Management', status: 'Pending' },
              { id: 'appr_3', approverName: 'Finance Head', role: 'Treasury', status: 'Pending' }
            ] : contract.approvals).map((appr: any) => (
              <div key={appr.id} className="flex items-start gap-3 p-3.5 border rounded-xl bg-white">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  appr.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  appr.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
                }`}>
                  {appr.status === 'Approved' ? <CheckCircle2 className="h-4 w-4" /> :
                   appr.status === 'Rejected' ? <XCircle className="h-4 w-4" /> :
                   <Clock className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold">{appr.approverName}</p>
                  <p className="text-[10px] text-muted-foreground">{appr.role}</p>
                  {appr.actionedAt && (
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">{new Date(appr.actionedAt).toLocaleDateString()}</p>
                  )}
                  {appr.comment && <p className="text-[11px] text-foreground mt-1 italic">"{appr.comment}"</p>}
                </div>
                <span className={`text-[9px] font-black uppercase shrink-0 ${
                  appr.status === 'Approved' ? 'text-emerald-600' :
                  appr.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'
                }`}>{appr.status}</span>
              </div>
            ))}
          </TabsContent>

          {/* Workflow Timeline Tab */}
          <TabsContent value="timeline" className="m-0 p-4 space-y-1">
            {STATUS_FLOW.map((status, i) => {
              const isDone = i < currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isDone ? 'bg-emerald-500 border-emerald-500 text-white' :
                    isCurrent ? 'bg-accent border-accent text-accent-foreground' :
                    'bg-muted/50 border-border text-muted-foreground'
                  }`}>
                    {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="text-[10px] font-black">{i + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${isCurrent ? 'text-accent' : isDone ? 'text-emerald-700' : 'text-muted-foreground'}`}>{status}</p>
                  </div>
                  {isCurrent && <span className="text-[9px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded">CURRENT</span>}
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Actions */}
      <Separator />
      <div className="p-4 space-y-2 shrink-0">
        {contract.status === 'Draft' || contract.status === 'Internal Review' ? (
          <Button className="w-full gap-2 bg-accent/10 text-accent hover:bg-accent/20 font-bold text-sm" variant="outline" onClick={handleRunAIAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? <span className="h-4 w-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isAnalyzing ? 'Running AI Analysis...' : 'Run AI Risk Analysis'}
          </Button>
        ) : null}
        {nextStatus && contract.status !== 'Signed' && (
          <Button className="w-full gap-2 font-bold" onClick={handleAdvanceStatus}>
            {nextStatus === 'Sent for Signing' ? <FileSignature className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {nextStatus === 'Sent for Signing' ? 'Send for E-Signature' : `Move to: ${nextStatus}`}
          </Button>
        )}
        {contract.status === 'Signed' && (
          <div className="flex items-center justify-center gap-2 py-2 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="h-4 w-4" /> Contract Fully Executed
          </div>
        )}
      </div>
    </div>
  );
}
