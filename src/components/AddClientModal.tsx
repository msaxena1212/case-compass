import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clientService } from "@/services/clientService";
import { toast } from "sonner";
import { AlertTriangle, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().optional(),
  type: z.enum(["Individual", "Corporate", "Association"]),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

type AddClientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: "Individual",
    }
  });

  const onSubmit = async (data: z.infer<typeof clientSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Logic for duplicate check could be added here via service
      
      const newClient = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address || '',
        type: data.type,
        status: 'Active',
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        notes: data.notes || '',
        health_score: 100,
        total_billed: 0,
        outstanding_amount: 0
      };

      await clientService.createClient(newClient as any);
      toast.success("Client onboarded successfully");
      
      reset();
      setDuplicateWarning(null);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(`Failed to onboard client: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Onboard New Client
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive profile to track client health and case history.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          {duplicateWarning && (
            <Alert variant="destructive" className="bg-amber-50 text-amber-900 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Duplicate Client Detected</AlertTitle>
              <AlertDescription className="text-amber-700">
                A client named "{duplicateWarning.name}" already exists with this email or phone. 
                Are you sure you want to create a new profile?
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name / Company Name *</Label>
              <Input id="name" {...register("name")} placeholder="e.g. Acme Corp or John Doe" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Client Type *</Label>
              <select id="type" {...register("type")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
                <option value="Association">Association</option>
              </select>
              {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" {...register("email")} placeholder="client@example.com" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" {...register("phone")} placeholder="+91 98765 43210" />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Billing Address</Label>
            <Input id="address" {...register("address")} placeholder="Full address for invoicing" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" {...register("tags")} placeholder="e.g. VIP, Retainer, Pro-bono (comma separated)" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes (Not visible to client)</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Key preferences, communication style, relationship history..." rows={3} />
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {duplicateWarning ? "Create Anyway" : "Save Client Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
