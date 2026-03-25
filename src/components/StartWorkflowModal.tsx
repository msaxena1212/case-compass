import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppTask } from "@/types/task";
import { mockCases, mockTasks, mockWorkflows } from "@/store/mockData";
import { useState } from "react";
import { toast } from "sonner";
import { Workflow, Sparkles } from "lucide-react";

interface StartWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function StartWorkflowModal({ open, onOpenChange, onComplete }: StartWorkflowModalProps) {
  const [caseId, setCaseId] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [assignee, setAssignee] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const activeWorkflow = mockWorkflows.find(w => w.id === workflowId);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId || !workflowId || !assignee) {
      toast.error("Case, Workflow, and Default Assignee are required.");
      return;
    }

    setIsProcessing(true);

    // Simulate AI pipeline generation delay
    setTimeout(() => {
      const generatedTasks: AppTask[] = activeWorkflow!.templateTasks.map((t, index) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + t.daysOffset);
        
        return {
          id: `tsk_wf_${Date.now()}_${index}`,
          caseId: caseId,
          title: t.title,
          description: t.description,
          assignedTo: assignee,
          createdBy: "System (Workflow)",
          status: "Pending",
          priority: t.priority,
          dueDate: dueDate.toISOString(),
          createdAt: new Date().toISOString()
        };
      });

      mockTasks.push(...generatedTasks);
      setIsProcessing(false);
      toast.success(`${generatedTasks.length} tasks generated and pipeline initiated.`);
      onComplete();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-accent" /> Start Automated Workflow
          </DialogTitle>
          <DialogDescription>
            Instantly generate a complete sequence of tasks for standard legal procedures.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleStart} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Target Case</Label>
            <Select value={caseId} onValueChange={setCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select case..." />
              </SelectTrigger>
              <SelectContent>
                {mockCases.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Workflow Template</Label>
            <Select value={workflowId} onValueChange={setWorkflowId}>
              <SelectTrigger>
                <SelectValue placeholder="Select workflow template..." />
              </SelectTrigger>
              <SelectContent>
                {mockWorkflows.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name} ({w.templateTasks.length} stages)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeWorkflow && (
            <div className="rounded-md border bg-muted/30 p-3 my-2 text-sm text-muted-foreground animate-in fade-in">
              <strong className="text-foreground block mb-2">Generated Pipeline Preview:</strong>
              <ol className="list-decimal pl-4 space-y-1 text-xs">
                {activeWorkflow.templateTasks.map((t, i) => (
                  <li key={i}>{t.title} <span className="text-[10px] bg-accent/10 px-1 rounded ml-1 text-accent">+ {t.daysOffset} days</span></li>
                ))}
              </ol>
            </div>
          )}

          <div className="space-y-2">
            <Label>Default Assignee for Pipeline</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select default executor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Junior Associate">Junior Associate</SelectItem>
                <SelectItem value="Adv. Joshi">Adv. Joshi</SelectItem>
                <SelectItem value="Adv. Mehta">Adv. Mehta</SelectItem>
                <SelectItem value="Adv. Kumar">Adv. Kumar (Self)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isProcessing}>
            {isProcessing ? (
              <>Generating Pipeline...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Initialize Workflow</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
