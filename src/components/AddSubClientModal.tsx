import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientService } from "@/services/clientService";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";

type AddSubClientModalProps = {
  parentClientId: string;
  parentClientName: string;
  isOpen: boolean;
  onClose: () => void;
};

export function AddSubClientModal({ parentClientId, parentClientName, isOpen, onClose }: AddSubClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('Individual');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { name: string; email: string; phone: string; type: string; notes?: string }) =>
      clientService.createSubClient(parentClientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-clients', parentClientId] });
      toast.success("Sub-client added successfully!");
      resetForm();
      onClose();
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`)
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setType('Individual');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    mutation.mutate({ name, email, phone, type, notes });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Sub-Client
          </DialogTitle>
          <DialogDescription>
            Create a sub-client under <span className="font-semibold text-foreground">{parentClientName}</span>. Sub-clients inherit the parent's case associations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input placeholder="e.g. Jane Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Client Type</Label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="Individual">Individual</option>
              <option value="Corporate">Corporate</option>
              <option value="Association">Association</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input placeholder="Relationship to parent client, role, etc." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !name.trim()} className="gap-2">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Add Sub-Client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
