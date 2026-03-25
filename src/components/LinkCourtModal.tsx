import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourtType, CourtCaseLink } from "@/types/court";
import { toast } from "sonner";
import { Scale, Link2, AlertCircle } from "lucide-react";

interface LinkCourtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  caseTitle: string;
  onLinked?: () => void;
}

const COURT_TYPES: CourtType[] = ['District Court', 'High Court', 'Supreme Court', 'Tribunal', 'Family Court', 'Consumer Court'];

const STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat',
  'Uttar Pradesh', 'Rajasthan', 'West Bengal', 'Telangana', 'Kerala'
];

import { courtTrackerService } from "@/services/courtTrackerService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function LinkCourtModal({ open, onOpenChange, caseId, caseTitle, onLinked }: LinkCourtModalProps) {
  const [courtType, setCourtType] = useState<CourtType>('District Court');
  const [courtName, setCourtName] = useState('');
  const [cnrNumber, setCnrNumber] = useState('');
  const [filingYear, setFilingYear] = useState(new Date().getFullYear().toString());
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('');
  const queryClient = useQueryClient();

  const { data: links = [] } = useQuery({
    queryKey: ['court-case-links'],
    queryFn: courtTrackerService.getLinkedCases,
    enabled: open
  });

  const currentLink = links.find((l: any) => l.caseId === caseId);

  const linkMutation = useMutation({
    mutationFn: (newLink: any) => courtTrackerService.linkCase(newLink),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-case-links'] });
      toast.success(`Case linked to ${courtName}. CNR: ${cnrNumber.toUpperCase()}`);
      onLinked?.();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to link case: ${error.message}`);
    }
  });

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnrNumber || !courtName) {
      toast.error('Court Name and CNR Number are required.');
      return;
    }

    if (cnrNumber.length < 8) {
      toast.error('Invalid CNR number format. Expected: MHNA01-234567-2024');
      return;
    }

    const newLink = {
      caseId,
      courtType,
      courtName,
      cnrNumber: cnrNumber.toUpperCase(),
      filingYear,
      state,
      district: district || '',
      syncStatus: 'Pending'
    };

    linkMutation.mutate(newLink);
  };

  const isValidating = linkMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent" /> Link to eCourts Portal
          </DialogTitle>
          <DialogDescription>
            Connect <strong>"{caseTitle}"</strong> to the national eCourts system for automatic sync.
          </DialogDescription>
        </DialogHeader>

        {currentLink && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 font-medium">
              This case is already linked to <strong>{currentLink.courtName}</strong> (CNR: {currentLink.cnrNumber}). Saving will overwrite the link.
            </p>
          </div>
        )}

        <form onSubmit={handleLink} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Court Type *</Label>
              <Select value={courtType} onValueChange={(v) => setCourtType(v as CourtType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COURT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Court Name *</Label>
            <Input
              value={courtName}
              onChange={e => setCourtName(e.target.value)}
              placeholder="e.g. Additional Sessions Court, Mumbai"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CNR / Case Number *</Label>
              <Input
                value={cnrNumber}
                onChange={e => setCnrNumber(e.target.value)}
                placeholder="e.g. MHNA01-123456-2024"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Filing Year *</Label>
              <Input
                value={filingYear}
                onChange={e => setFilingYear(e.target.value)}
                placeholder="2024"
                maxLength={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>District (if applicable)</Label>
            <Input
              value={district}
              onChange={e => setDistrict(e.target.value)}
              placeholder="e.g. Nagpur"
            />
          </div>

          <Button type="submit" className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold" disabled={isValidating}>
            {isValidating ? (
              <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Validating with eCourts...</>
            ) : (
              <><Link2 className="h-4 w-4" /> Link & Start Tracking</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
