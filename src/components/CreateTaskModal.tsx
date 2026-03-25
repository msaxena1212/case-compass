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
import { AppTask, TaskPriority, TaskStatus } from "@/types/task";
import { mockCases, mockTasks } from "@/store/mockData";
import { useState } from "react";
import { toast } from "sonner";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function CreateTaskModal({ open, onOpenChange, onComplete }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [caseId, setCaseId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [dueDate, setDueDate] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedTo || !dueDate) {
      toast.error("Title, Assignee, and Due Date are required.");
      return;
    }

    const newTask: AppTask = {
      id: `tsk_${Date.now()}`,
      title,
      description,
      caseId: caseId || undefined,
      assignedTo,
      createdBy: "Adv. Kumar",
      status: "Pending",
      priority,
      dueDate: new Date(dueDate).toISOString(),
      createdAt: new Date().toISOString()
    };

    // Temporarily pushing to mock array (in real app, this goes to backend)
    mockTasks.unshift(newTask);
    toast.success("Task created and assigned successfully.");
    
    // Reset form
    setTitle("");
    setDescription("");
    setCaseId("");
    setAssignedTo("");
    setPriority("Medium");
    setDueDate("");
    
    onComplete();
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
                {mockCases.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee *</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adv. Kumar">Adv. Kumar (Self)</SelectItem>
                  <SelectItem value="Adv. Joshi">Adv. Joshi</SelectItem>
                  <SelectItem value="Adv. Mehta">Adv. Mehta</SelectItem>
                  <SelectItem value="Junior Associate">Junior Associate</SelectItem>
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

          <Button type="submit" className="w-full">Create Task</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
