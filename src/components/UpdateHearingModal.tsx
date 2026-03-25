import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { mockHearings, generateId } from "@/store/mockData";
import { Hearing, HearingStatus } from "@/types/hearing";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const updateHearingSchema = z.object({
  outcome: z.string().min(1, "Outcome is required"),
  notes: z.string().optional(),
  
  // Next Hearing Details
  scheduleNext: z.boolean().default(false),
  nextDate: z.string().optional(),
  nextTime: z.string().optional(),
  nextStage: z.string().optional(),
});

type UpdateHearingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  hearingId: string | null;
  onSuccess?: () => void;
};

export function UpdateHearingModal({ isOpen, onClose, hearingId, onSuccess }: UpdateHearingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hearing = hearingId ? mockHearings.find(h => h.id === hearingId) : null;

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<z.infer<typeof updateHearingSchema>>({
    resolver: zodResolver(updateHearingSchema),
    defaultValues: {
      scheduleNext: true
    }
  });

  const scheduleNext = watch("scheduleNext");

  const onSubmit = (data: z.infer<typeof updateHearingSchema>) => {
    if (!hearing) return;
    setIsSubmitting(true);

    // Update current hearing
    hearing.status = 'Completed';
    hearing.outcome = data.outcome;
    if (data.notes) hearing.notes = (hearing.notes ? hearing.notes + "\n\nUpdate: " : "") + data.notes;

    // Create next hearing if requested
    if (data.scheduleNext && data.nextDate && data.nextTime && data.nextStage) {
      const dateTimeIso = new Date(`${data.nextDate}T${data.nextTime}`).toISOString();
      const newHearing: Hearing = {
        id: generateId('hrg'),
        caseId: hearing.caseId,
        title: hearing.title,
        date: dateTimeIso,
        court: hearing.court,
        judge: hearing.judge,
        stage: data.nextStage,
        status: 'Upcoming',
      };
      mockHearings.push(newHearing);
      hearing.nextHearingId = newHearing.id;
      toast.success("Hearing marked complete & next date scheduled!");
    } else {
      toast.success("Hearing marked complete!");
    }
    
    reset();
    setIsSubmitting(false);
    onSuccess?.();
    onClose();
  };

  if (!hearing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Hearing Outcome</DialogTitle>
          <DialogDescription>
            Record what happened during the hearing and schedule the next date.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="bg-muted/30 p-3 rounded-md border text-sm space-y-1">
            <p><span className="font-medium">Case:</span> {hearing.title}</p>
            <p><span className="font-medium">Court:</span> {hearing.court}</p>
            <p><span className="font-medium">Stage:</span> {hearing.stage}</p>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="outcome">Outcome / Judge's Order *</Label>
            <Textarea id="outcome" {...register("outcome")} placeholder="Summary of what transpired..." rows={3} />
            {errors.outcome && <p className="text-xs text-red-500">{errors.outcome.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Notes for next time..." rows={2} />
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox 
                id="scheduleNext" 
                checked={scheduleNext} 
                onCheckedChange={(c) => setValue("scheduleNext", !!c)} 
              />
              <Label htmlFor="scheduleNext" className="font-medium cursor-pointer">
                Schedule Next Hearing Date
              </Label>
            </div>

            {scheduleNext && (
              <div className="space-y-4 bg-muted/20 p-4 rounded-md border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nextDate">Date *</Label>
                    <Input id="nextDate" type="date" {...register("nextDate")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextTime">Time *</Label>
                    <Input id="nextTime" type="time" {...register("nextTime")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextStage">Next Stage *</Label>
                  <select id="nextStage" {...register("nextStage")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select stage...</option>
                    <option value="Framing of Issues">Framing of Issues</option>
                    <option value="Evidence">Evidence</option>
                    <option value="Cross Examination">Cross Examination</option>
                    <option value="Arguments">Arguments</option>
                    <option value="Judgment">Judgment</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Complete Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
