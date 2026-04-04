import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billingService";
import { caseService } from "@/services/caseService";
import { TimeEntry } from "@/types/billing";
import { toast } from "sonner";
import { Clock, Loader2 } from "lucide-react";

type LogTimeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function LogTimeModal({ isOpen, onClose, onSuccess }: LogTimeModalProps) {
  const [caseId, setCaseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [rate, setRate] = useState('5000');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const queryClient = useQueryClient();

  // Fetch cases to select from
  const { data: casesResponse, isLoading: loadingCases } = useQuery({
    queryKey: ['cases'],
    queryFn: () => caseService.getAllCases(1, 1000),
    enabled: isOpen
  });
  const cases = casesResponse?.data || [];

  const mutation = useMutation({
    mutationFn: (newEntry: Omit<TimeEntry, 'id' | 'createdAt'>) => 
      billingService.saveTimeEntry(newEntry),
    onSuccess: () => {
      toast.success(`Logged successfully`);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      // Reset
      setCaseId('');
      setHours('');
      setMinutes('');
      setDescription('');
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caseId) {
      toast.error('Please select a case');
      return;
    }
    
    const h = parseInt(hours || '0');
    const m = parseInt(minutes || '0');
    const totalMins = (h * 60) + m;

    if (totalMins <= 0) {
      toast.error('Duration must be greater than 0');
      return;
    }

    const selectedCase = cases.find(c => c.id === caseId);
    
    mutation.mutate({
      caseId,
      clientId: selectedCase?.clientId || '',
      userId: 'Adv. Kumar', // Mocking current user for now
      date: new Date(date).toISOString(),
      durationMinutes: totalMins,
      ratePerHour: parseInt(rate || '0'),
      description,
      billable,
      billed: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Log Manual Time Entry
          </DialogTitle>
          <DialogDescription>
            Record billable or non-billable hours spent on a specific case.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Related Case *</Label>
            <select 
              value={caseId}
              onChange={e => setCaseId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Select a case...</option>
              {loadingCases ? (
                <option disabled>Loading cases...</option>
              ) : (
                cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.clientName || 'Private'})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date & Time *</Label>
              <Input 
                type="datetime-local" 
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Hourly Rate (₹) *</Label>
              <Input 
                type="number" 
                value={rate}
                onChange={e => setRate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hours *</Label>
              <Input 
                type="number" 
                min="0"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
            <div className="space-y-2">
              <Label>Minutes *</Label>
              <Input 
                type="number" 
                min="0"
                max="59"
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description of Work *</Label>
            <Textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Drafted reply to legal notice, reviewed client documents..." 
              rows={3}
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label>Billable Component</Label>
              <p className="text-[10px] text-muted-foreground">Will this time be invoiced to the client?</p>
            </div>
            <Switch 
              checked={billable}
              onCheckedChange={setBillable}
            />
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Time Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
