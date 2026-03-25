export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface AppTask {
  id: string;
  title: string;
  description?: string;
  caseId?: string; // Optional (could be firm admin task)
  caseName?: string; // Joined field for UI
  assignedTo: string; // User ID/Name
  createdBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  dependencies?: string[]; // List of task IDs that must be completed first
}

// Config for auto-generating tasks based on Case Type
export interface WorkflowConfig {
  id: string;
  name: string;
  caseType: string;
  templateTasks: {
    title: string;
    description: string;
    daysOffset: number; // e.g. +3 days from trigger
    priority: TaskPriority;
  }[];
}
