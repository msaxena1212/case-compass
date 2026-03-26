import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { communicationService } from "@/services/communicationService";
import { caseService } from "@/services/caseService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Communication, CommunicationType } from "@/types/client";
import { toast } from "sonner";
import { MessageSquarePlus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

type LogCommunicationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  defaultCaseId?: string;
  onSuccess?: () => void;
};

export function LogCommunicationModal({ isOpen, onClose, clientId, defaultCaseId, onSuccess }: LogCommunicationModalProps) {
  const [type, setType] = useState<CommunicationType>('Call');
  const [caseId, setCaseId] = useState(defaultCaseId || '');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: casesResponse } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const response = await caseService.getAllCases(1, 1000);
      return (response?.data || []).filter((c: any) => c.clientId === clientId);
    },
    enabled: isOpen && !!clientId
  });
  const cases = casesResponse || [];

  const logMutation = useMutation({
    mutationFn: (newComm: any) => communicationService.logCommunication(newComm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-logs'] });
      toast.success(`${type} logged successfully`);
      
      if (followUpDate) {
        toast.info(`Follow-up reminder set for ${new Date(followUpDate).toLocaleDateString()}`);
      }

      setSummary('');
      setNotes('');
      setFollowUpDate('');
      setType('Call');
      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to log interaction: ${error.message}`);
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!summary.trim()) {
      toast.error('Summary is required');
      return;
    }

    setIsSubmitting(true);

    const newComm = {
      clientId: clientId,
      caseId: caseId || null,
      type,
      summary,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
      loggedBy: 'Adv. Kumar', // In real app, fetch from auth context
      channel: (type === 'WhatsApp' ? 'WhatsApp' : type === 'Meeting' ? 'In-App' : type) as any,
      status: 'Delivered',
      content: summary
    };

    logMutation.mutate(newComm as any);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5" /> Log Interaction
          </DialogTitle>
          <DialogDescription>
            Record calls, emails, or meetings to maintain a complete client history.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Interaction Type *</Label>
              <select 
                value={type}
                onChange={e => setType(e.target.value as CommunicationType)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Call">Phone Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting (In Person/Virtual)</option>
                <option value="WhatsApp">WhatsApp / Chat</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Related Case (Optional)</Label>
              <select 
                value={caseId}
                onChange={e => setCaseId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">General (No Case)</option>
                {cases.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-[10px] mt-1 flex items-center gap-1"
                onClick={() => navigate('/cases/new')}
              >
                <Plus className="h-2 w-2" /> New Case
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Summary *</Label>
            <Input 
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="e.g. Discussed settlement strategy" 
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Detailed Notes</Label>
            <Textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Client agreed to XYZ. Asked us to hold off on filing until Friday..." 
              rows={4} 
            />
          </div>

          <div className="space-y-2">
            <Label>Follow-up Reminder (Optional)</Label>
            <Input 
              type="datetime-local" 
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">Select a date to be reminded to follow up on this interaction.</p>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Log Interaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
