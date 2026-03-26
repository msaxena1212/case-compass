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
import { useState } from "react";
import { toast } from "sonner";
import { Workflow, Sparkles } from "lucide-react";

interface StartWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

import { taskService } from "@/services/taskService";
import { caseService } from "@/services/caseService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function StartWorkflowModal({ open, onOpenChange, onComplete }: StartWorkflowModalProps) {
  const [caseId, setCaseId] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [assignee, setAssignee] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: casesResponse } = useQuery({
    queryKey: ['cases'],
    queryFn: () => caseService.getAllCases(1, 1000),
    enabled: open
  });
  const cases = casesResponse?.data || [];

  // Mock workflows are fine for now as templates, but let's assume they might come from a service
  const { data: workflows = [] } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      // For now, returning mock workflows but could be a service call
      const { mockWorkflows } = await import("@/store/mockData");
      return mockWorkflows;
    },
    enabled: open
  });

  const activeWorkflow = workflows.find((w: any) => w.id === workflowId);

  const workflowMutation = useMutation({
    mutationFn: async (tasks: any[]) => {
      for (const task of tasks) {
        await taskService.createTask(task);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsProcessing(false);
      toast.success(`${activeWorkflow?.templateTasks.length} tasks generated and pipeline initiated.`);
      onComplete();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to start workflow: ${error.message}`);
      setIsProcessing(false);
    }
  });

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId || !workflowId || !assignee) {
      toast.error("Case, Workflow, and Default Assignee are required.");
      return;
    }

    setIsProcessing(true);

    const generatedTasks = activeWorkflow!.templateTasks.map((t: any) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + t.daysOffset);
      
      return {
        case_id: caseId,
        title: t.title,
        description: t.description,
        assigned_to: assignee,
        created_by: "System (Workflow)",
        status: "Pending",
        priority: t.priority,
        due_date: dueDate.toISOString(),
      };
    });

    workflowMutation.mutate(generatedTasks);
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
                {cases.map((c: any) => (
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
                {workflows.map((w: any) => (
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
