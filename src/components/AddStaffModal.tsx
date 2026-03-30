import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { officeService } from "@/services/officeService";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";

type AddStaffModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Lawyer');
  const [officeId, setOfficeId] = useState('');
  const [department, setDepartment] = useState('');
  const queryClient = useQueryClient();

  const { data: offices = [] } = useQuery({
    queryKey: ['all-offices'],
    queryFn: () => officeService.getAllOffices(),
    enabled: isOpen
  });

  const mutation = useMutation({
    mutationFn: (newStaff: any) => officeService.createStaffMember(newStaff),
    onSuccess: () => {
      toast.success(`Staff member added successfully`);
      queryClient.invalidateQueries({ queryKey: ['firm-staff'] });
      setName('');
      setEmail('');
      setRole('Lawyer');
      setOfficeId('');
      setDepartment('');
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeId) {
      toast.error("Please select an office branch");
      return;
    }
    mutation.mutate({ name, email, role, officeId, department });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-accent" /> Add Firm Professional
          </DialogTitle>
          <DialogDescription>
            Onboard a new lawyer, partner, or associate to your firm's digital workspace.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input 
              id="name" 
              placeholder="e.g. Adv. Rajesh Kumar" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Firm Email *</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@firm.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">System Role *</Label>
              <select 
                id="role"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background divide-y"
              >
                <option value="Admin">Admin</option>
                <option value="Partner">Partner</option>
                <option value="Lawyer">Lawyer</option>
                <option value="Junior Associate">Junior Associate</option>
                <option value="Client">Client (External)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="office">Office Branch *</Label>
              <select 
                id="office"
                value={officeId}
                onChange={e => setOfficeId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              >
                <option value="">Select Branch...</option>
                {offices.map((off: any) => (
                  <option key={off.id} value={off.id}>{off.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department / Practice Area</Label>
            <Input 
              id="department" 
              placeholder="e.g. Litigation, Corporate, Family Law" 
              value={department} 
              onChange={e => setDepartment(e.target.value)} 
            />
          </div>

          <div className="pt-2">
            <p className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded border border-dashed">
              Note: This will create a profile record. The user will be able to log in once they confirm their email or via SSO.
            </p>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Onboard Professional
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
