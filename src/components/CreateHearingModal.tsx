import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { courtService } from "@/services/courtService";
import { caseService } from "@/services/caseService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const hearingSchema = z.object({
  caseId: z.string().min(1, "Case is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  court: z.string().min(1, "Court is required"),
  judge: z.string().optional(),
  stage: z.string().min(1, "Stage is required"),
  notes: z.string().optional(),
});

type CreateHearingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultCaseId?: string;
  onSuccess?: () => void;
};

export function CreateHearingModal({ isOpen, onClose, defaultCaseId, onSuccess }: CreateHearingModalProps) {
  const [clashWarning, setClashWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: cases = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: caseService.getAllCases,
    enabled: !defaultCaseId
  });

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<z.infer<typeof hearingSchema>>({
    resolver: zodResolver(hearingSchema),
    defaultValues: {
      caseId: defaultCaseId || "",
    }
  });

  const onSubmit = async (data: z.infer<typeof hearingSchema>) => {
    setIsSubmitting(true);
    const dateTimeIso = new Date(`${data.date}T${data.time}`).toISOString();
    
    try {
      // Check for clash via service
      if (!clashWarning) {
        const hasClash = await courtService.checkHearingClash(dateTimeIso);
        if (hasClash) {
          setClashWarning(true);
          setIsSubmitting(false);
          return; 
        }
      }

      const newHearing = {
        case_id: data.caseId,
        date: dateTimeIso,
        court: data.court,
        judge: data.judge || '',
        stage: data.stage,
        status: 'Upcoming',
        notes: data.notes || '',
      };

      await courtService.createHearing(newHearing as any);
      toast.success("Hearing scheduled successfully");
      
      reset();
      setClashWarning(false);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(`Failed to schedule hearing: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Hearing</DialogTitle>
          <DialogDescription>
            Schedule a new court date. The reminder engine will be automatically activated.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          {clashWarning && (
            <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Scheduling Conflict Detected</AlertTitle>
              <AlertDescription className="text-red-700">
                You already have a hearing scheduled within 1 hour of this time. Are you sure you want to proceed?
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="caseId">Case ID / Reference *</Label>
            <select id="caseId" {...register("caseId")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={!!defaultCaseId}>
              <option value="">Select Case...</option>
              {cases.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title} ({c.case_number})</option>
              ))}
            </select>
            {errors.caseId && <p className="text-xs text-red-500">{errors.caseId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input id="time" type="time" {...register("time")} />
              {errors.time && <p className="text-xs text-red-500">{errors.time.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="court">Court *</Label>
            <Input id="court" {...register("court")} placeholder="e.g. High Court, Room 4b" />
            {errors.court && <p className="text-xs text-red-500">{errors.court.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="judge">Judge (Optional)</Label>
              <Input id="judge" {...register("judge")} placeholder="Hon. Judge Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage *</Label>
              <select id="stage" {...register("stage")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select stage...</option>
                <option value="First Hearing">First Hearing</option>
                <option value="Framing of Issues">Framing of Issues</option>
                <option value="Evidence">Evidence</option>
                <option value="Cross Examination">Cross Examination</option>
                <option value="Arguments">Arguments</option>
                <option value="Judgment">Judgment</option>
              </select>
              {errors.stage && <p className="text-xs text-red-500">{errors.stage.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Preparation</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Any specific notes for this hearing..." rows={3} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {clashWarning ? "Proceed Anyway" : "Save Hearing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
