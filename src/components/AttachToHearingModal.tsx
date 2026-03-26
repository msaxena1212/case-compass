import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { courtService } from "@/services/courtService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link2, Calendar, Loader2 } from "lucide-react";
import { LegalDocument } from "@/types/document";
import { formatDate } from "@/utils/formatters";

type AttachToHearingModalProps = {
  document: LegalDocument;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AttachToHearingModal({ document: doc, isOpen, onClose, onSuccess }: AttachToHearingModalProps) {
  const [selectedHearingId, setSelectedHearingId] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const queryClient = useQueryClient();

  const { data: hearingsResponse, isLoading } = useQuery({
    queryKey: ['hearings', doc.caseId],
    queryFn: async () => {
      const allHearings = await courtService.getAllHearings();
      // Filter by caseId if possible, or just show upcoming
      return allHearings.filter(h => h.caseId === doc.caseId || !doc.caseId);
    },
    enabled: isOpen
  });

  const linkMutation = useMutation({
    mutationFn: async (hearingId: string) => {
      // Logic to link document to hearing (e.g. update a join table or metadata)
      console.log(`Linking doc ${doc.id} to hearing ${hearingId}`);
      return new Promise((resolve) => setTimeout(resolve, 800));
    },
    onSuccess: () => {
      toast.success("Document attached to hearing successfully");
      setIsLinking(false);
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Linking failed: ${error.message}`);
      setIsLinking(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHearingId) {
      toast.error("Please select a hearing");
      return;
    }
    setIsLinking(true);
    linkMutation.mutate(selectedHearingId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" /> Attach to Hearing
          </DialogTitle>
          <DialogDescription>
            Select a hearing for Case: {doc.caseName} to link this document.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Select Hearing *</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
                {hearingsResponse && hearingsResponse.length > 0 ? hearingsResponse.map(h => (
                  <label key={h.id} className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors ${selectedHearingId === h.id ? 'bg-accent/5 border-accent/20' : ''}`}>
                    <input 
                      type="radio" 
                      name="hearing" 
                      className="mt-1" 
                      checked={selectedHearingId === h.id}
                      onChange={() => setSelectedHearingId(h.id)}
                    />
                    <div>
                      <p className="text-sm font-semibold">{h.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3" /> {formatDate(h.date)}
                        <span className="bg-muted px-1.5 py-0.5 rounded">{h.status}</span>
                      </div>
                    </div>
                  </label>
                )) : (
                  <p className="p-8 text-center text-sm text-muted-foreground italic">No hearings found for this case.</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLinking || !selectedHearingId} className="gap-2">
              {isLinking && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Attachment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
