import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Contract, ContractType } from "@/types/contract";
import { toast } from "sonner";
import { FileText, Sparkles, ChevronRight } from "lucide-react";

interface CreateContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (contract: Contract) => void;
}

import { contractService } from "@/services/contractService";
import { contractTemplates } from "@/services/contractTemplates";
import { caseService } from "@/services/caseService";
import { useQuery } from "@tanstack/react-query";

export function CreateContractModal({ open, onOpenChange, onCreated }: CreateContractModalProps) {
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [title, setTitle] = useState('');
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [caseId, setCaseId] = useState('');
  const [value, setValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: casesResponse } = useQuery({
    queryKey: ['cases'],
    queryFn: () => caseService.getAllCases(1, 1000)
  });
  const cases = casesResponse?.data || [];

  const template = contractTemplates.find(t => t.id === selectedTemplate);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !partyA || !partyB) {
      toast.error('Title and both parties are required.');
      return;
    }

    setIsGenerating(true);
    try {
      // AI Drafting Simulation - Generate realistic content
      const draftedClauses = template ? template.defaultClauses.map((ct, i) => ({
        id: `cl_new_${i}`,
        type: ct,
        isCustom: false,
        riskLevel: i % 3 === 0 ? 'Medium' : 'Low' as any,
        title: ct,
        content: `Drafting ${ct} clause for ${title} between ${partyA} and ${partyB}... This clause outlines the specific legal obligations and protections regarding ${ct.toLowerCase()} in accordance with the Indian Contract Act.`,
        aiFlag: i === 0 ? "Standard AI-drafted clause" : undefined
      })) : [];

      const selectedCase = cases.find((c: any) => c.id === caseId);

      const newContract: any = {
        title,
        type: template?.type || 'NDA',
        status: 'Draft',
        parties: { partyA, partyB },
        caseId: caseId !== 'none' ? caseId : undefined,
        clientId: selectedCase?.clientId || undefined, // Resolve clientId from selected case
        riskScore: Math.floor(Math.random() * 40) + 10,
        value: value ? parseFloat(value) : undefined,
        expiryDate: expiryDate || undefined,
        clauses: draftedClauses,
        approvals: [],
        version: 1
      };

      const result = await contractService.createContract(newContract);
      toast.success(`Draft of "${title}" generated successfully via Legal AI.`);
      onCreated?.(result as any);
      onOpenChange(false);
      // Reset
      setStep('template'); setSelectedTemplate(''); setTitle(''); setPartyA(''); setPartyB(''); setCaseId(''); setValue(''); setExpiryDate('');
    } catch (error: any) {
      toast.error(`Failed to generate contract: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" /> Create New Contract
          </DialogTitle>
          <DialogDescription>
            {step === 'template' ? 'Choose a template to get started with pre-built clauses.' : 'Fill in contract details and parties.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'template' ? (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 gap-2">
              {contractTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 group ${
                    selectedTemplate === t.id ? 'border-accent bg-accent/5' : 'border-border/50 hover:border-accent/40 bg-white'
                  }`}
                >
                  <span className="text-2xl leading-none mt-0.5 shrink-0">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{t.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.defaultClauses.map(c => (
                        <span key={c} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/60 border text-muted-foreground">{c}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 mt-1 transition-opacity text-accent ${selectedTemplate === t.id ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </div>
            <Button
              className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
              disabled={!selectedTemplate}
              onClick={() => setStep('details')}
            >
              Continue with {template?.label || 'Template'} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Contract Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={`e.g. ${template?.label} — Client Name`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Party A (Your Client) *</Label>
                <Input value={partyA} onChange={e => setPartyA(e.target.value)} placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label>Party B (Counterparty) *</Label>
                <Input value={partyB} onChange={e => setPartyB(e.target.value)} placeholder="e.g. Vendor Pvt. Ltd." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contract Value (₹)</Label>
                <Input value={value} onChange={e => setValue(e.target.value)} type="number" placeholder="e.g. 5000000" />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input value={expiryDate} onChange={e => setExpiryDate(e.target.value)} type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Link to Case (Optional)</Label>
              <Select value={caseId} onValueChange={setCaseId}>
                <SelectTrigger><SelectValue placeholder="Select case..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No case link</SelectItem>
                  {cases.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setStep('template')} className="flex-1">← Back</Button>
              <Button type="submit" className="flex-1 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold" disabled={isGenerating}>
                {isGenerating ? <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : <><Sparkles className="h-4 w-4" /> Create Draft</>}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
