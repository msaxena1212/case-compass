import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppTask, TaskPriority } from "@/types/task";
import { useState } from "react";
import { toast } from "sonner";
import { taskService } from "@/services/taskService";
import { caseService } from "@/services/caseService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Map display names → profile UUIDs
// The UUID 6bf900f2-84a8-4f3a-9f89-7eebadf12596 is the seeded profile for Adv. Kumar
const TEAM_MEMBERS = [
  { label: "Adv. Kumar (Self)", name: "Adv. Kumar", uuid: "6bf900f2-84a8-4f3a-9f89-7eebadf12596" },
  { label: "Adv. Joshi",        name: "Adv. Joshi",  uuid: "6bf900f2-84a8-4f3a-9f89-7eebadf12596" },
  { label: "Adv. Mehta",        name: "Adv. Mehta",  uuid: "6bf900f2-84a8-4f3a-9f89-7eebadf12596" },
  { label: "Junior Associate",  name: "Junior Associate", uuid: "6bf900f2-84a8-4f3a-9f89-7eebadf12596" },
];

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function CreateTaskModal({ open, onOpenChange, onComplete }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [caseId, setCaseId] = useState("");
  const [assigneeUuid, setAssigneeUuid] = useState(TEAM_MEMBERS[0].uuid);
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [dueDate, setDueDate] = useState("");
  const queryClient = useQueryClient();

  const { data: casesResponse } = useQuery({
    queryKey: ['cases'],
    queryFn: () => caseService.getAllCases(1, 1000),
    enabled: open
  });
  const cases = casesResponse?.data || [];

  const taskMutation = useMutation({
    mutationFn: (newTask: any) => taskService.createTask(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task created and assigned successfully.");
      
      // Reset form
      setTitle("");
      setDescription("");
      setCaseId("");
      setAssigneeUuid(TEAM_MEMBERS[0].uuid);
      setPriority("Medium");
      setDueDate("");
      
      onComplete();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assigneeUuid || !dueDate) {
      toast.error("Title, Assignee, and Due Date are required.");
      return;
    }

    const newTask = {
      title,
      description,
      case_id: caseId === "none" ? null : (caseId || null),
      assigned_to: assigneeUuid,
      created_by: TEAM_MEMBERS[0].uuid, // logged-in user UUID
      status: "Pending",
      priority,
      due_date: new Date(dueDate).toISOString(),
    };

    taskMutation.mutate(newTask as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
          <DialogDescription>
            Create a task and assign it to a team member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Task Title *</Label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Draft Property Sale Deed" 
            />
          </div>

          <div className="space-y-2">
            <Label>Link to Case (Optional)</Label>
            <Select value={caseId} onValueChange={setCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select relevant case..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Firm Admin / General --</SelectItem>
                {cases.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee *</Label>
              <Select value={assigneeUuid} onValueChange={setAssigneeUuid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map(m => (
                    <SelectItem key={m.label} value={m.uuid}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Input 
              type="date"
              value={dueDate} 
              onChange={e => setDueDate(e.target.value)} 
            />
          </div>

          <Button type="submit" className="w-full" disabled={taskMutation.isPending}>
            {taskMutation.isPending ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
