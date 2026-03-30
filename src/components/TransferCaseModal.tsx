import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { officeService } from "@/services/officeService";
import { caseService } from "@/services/caseService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ArrowRightLeft, Building2, User } from "lucide-react";

interface TransferCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseTitle: string;
  currentOfficeId?: string;
  currentLawyerId?: string;
}

export function TransferCaseModal({ 
  isOpen, 
  onClose, 
  caseId, 
  caseTitle,
  currentOfficeId,
  currentLawyerId
}: TransferCaseModalProps) {
  const queryClient = useQueryClient();
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(currentOfficeId || "");
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>(currentLawyerId || "");

  const { data: offices = [], isLoading: loadingOffices } = useQuery({
    queryKey: ['all-offices'],
    queryFn: () => officeService.getAllOffices()
  });

  const { data: staff = [], isLoading: loadingStaff } = useQuery({
    queryKey: ['staff-by-office', selectedOfficeId],
    queryFn: () => officeService.getStaffByOffice(selectedOfficeId),
    enabled: !!selectedOfficeId
  });

  const transferMutation = useMutation({
    mutationFn: () => caseService.transferCase(caseId, selectedLawyerId, selectedOfficeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success("Case successfully transferred");
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Transfer failed: ${error.message}`);
    }
  });

  const handleTransfer = () => {
    if (!selectedOfficeId || !selectedLawyerId) {
      toast.error("Please select both an office and a lawyer");
      return;
    }
    transferMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-accent" />
            Transfer Case
          </DialogTitle>
          <DialogDescription>
            Change the administrative office and primary legal advocate for <span className="font-bold text-foreground">"{caseTitle}"</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Office Branch</Label>
            <Select 
              value={selectedOfficeId} 
              onValueChange={(val) => {
                setSelectedOfficeId(val);
                setSelectedLawyerId(""); // Reset lawyer when office changes
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Office" />
              </SelectTrigger>
              <SelectContent>
                {offices.map((office: any) => (
                  <SelectItem key={office.id} value={office.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 opacity-50" />
                      <span>{office.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Primary Advocate</Label>
            <Select 
              value={selectedLawyerId} 
              onValueChange={setSelectedLawyerId}
              disabled={!selectedOfficeId || loadingStaff}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={!selectedOfficeId ? "Select an office first" : "Select Lawyer"} />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member: any) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 opacity-50" />
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingStaff && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Fetching team members...
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={transferMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleTransfer} 
            disabled={!selectedOfficeId || !selectedLawyerId || transferMutation.isPending}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {transferMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              "Confirm Transfer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
