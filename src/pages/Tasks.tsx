import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";
import { caseService } from "@/services/caseService";
import { AppTask, TaskStatus } from "@/types/task";
import { 
  CheckCircle2, Clock, ListTodo, Plus, 
  AlertCircle, BarChart3, User, Archive, Loader2, Trash2 
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatters";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'Pending': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getPriorityColor = (priority: string) => {
  if (priority === 'High') return 'text-destructive';
  if (priority === 'Medium') return 'text-amber-600';
  return 'text-emerald-600';
};

export default function Tasks() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'Team' | 'My Tasks'>('Team');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const currentUser = "Adv. Kumar";

  const { data: response, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', page],
    queryFn: () => taskService.getAllTasks(page, pageSize)
  });

  const tasks = response?.data || [];
  const totalCount = response?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: TaskStatus }) => 
      taskService.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated');
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    },
    onError: () => toast.error('Failed to delete task')
  });

  // Filter tasks based on view mode
  const displayedTasks = useMemo(() => {
    return viewMode === 'Team' 
      ? tasks 
      : tasks.filter(t => t.assignedTo === currentUser || t.createdBy === currentUser);
  }, [viewMode, tasks]);

  // Grouping for Kanban/List
  const overdueTasks = displayedTasks.filter(t => t.status === 'Overdue' || (t.status !== 'Completed' && new Date(t.dueDate) < new Date()));
  const pendingTasks = displayedTasks.filter(t => t.status === 'Pending' && !overdueTasks.includes(t));
  const inProgressTasks = displayedTasks.filter(t => t.status === 'In Progress' && !overdueTasks.includes(t));
  const completedTasks = displayedTasks.filter(t => t.status === 'Completed').sort((a,b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime()).slice(0, 10);

  // Stats
  const completionRate = displayedTasks.length > 0 
    ? Math.round((displayedTasks.filter(t => t.status === 'Completed').length / displayedTasks.length) * 100) 
    : 0;

  const markComplete = (task: AppTask) => {
    updateStatusMutation.mutate({ id: task.id, status: 'Completed' });
  };

  const startProgress = (task: AppTask) => {
    updateStatusMutation.mutate({ id: task.id, status: 'In Progress' });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateStatusMutation.mutate({ id: taskId, status });
    }
  };

  if (loadingTasks) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing Firm Tasks...</p>
        </div>
      </AppLayout>
    );
  }

  const TaskCard = ({ task }: { task: AppTask }) => {
    return (
      <div 
        draggable
        onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
        className="cursor-move p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all group flex flex-col h-full animate-in fade-in slide-in-from-bottom-2"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 items-center">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${getStatusColor(task.status === 'Pending' && new Date(task.dueDate) < new Date() ? 'Overdue' : task.status)}`}>
              {task.status === 'Pending' && new Date(task.dueDate) < new Date() ? 'Overdue' : task.status}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
              {task.priority} Pri
            </span>
          </div>
          {task.status !== 'Completed' && (
             <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => markComplete(task)}>
               <CheckCircle2 className="h-4 w-4 text-muted-foreground hover:text-success" />
             </Button>
          )}
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={(e) => { e.stopPropagation(); if (confirm('Delete this task?')) deleteTaskMutation.mutate(task.id); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <h4 className="font-semibold text-sm leading-snug mb-1">{task.title}</h4>
        {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}
        {task.caseName && <p className="text-[10px] font-medium text-accent hover:underline cursor-pointer mb-3 truncate block border bg-accent/5 px-1.5 py-0.5 rounded-sm w-fit max-w-full">Case: {task.caseName}</p>}
        
        <div className="mt-auto pt-3 border-t flex justify-between items-center text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
            <User className="h-3 w-3" /> {task.assignedTo}
          </span>
          <span className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-destructive font-bold' : ''}`}>
             <Clock className="h-3 w-3" /> {formatDate(task.dueDate, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        {/* Quick Actions (only if user is assignee) */}
        {task.status === 'Pending' && task.assignedTo === currentUser && (
          <Button size="sm" className="w-full mt-3 h-7 text-[10px] uppercase font-bold tracking-wider" onClick={() => startProgress(task)}>
            Start Task
          </Button>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Task Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Assign work and track execution across your firm.
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shrink-0" onClick={() => setIsTaskModalOpen(true)}>
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>

        {/* View Toggle & Top Stats */}
        <div className="flex flex-col lg:flex-row gap-6">
           <div className="flex bg-muted/50 p-1 rounded-lg shrink-0 w-fit h-fit border border-border/50">
             <Button 
               variant="ghost" 
               size="sm" 
               className={`rounded-md px-6 ${viewMode === 'Team' ? 'bg-white shadow-sm font-semibold' : 'text-muted-foreground font-medium'}`}
               onClick={() => setViewMode('Team')}
             >
               Firm Overview
             </Button>
             <Button 
               variant="ghost" 
               size="sm" 
               className={`rounded-md px-6 ${viewMode === 'My Tasks' ? 'bg-white shadow-sm font-semibold' : 'text-muted-foreground font-medium'}`}
               onClick={() => setViewMode('My Tasks')}
             >
               My Tasks
             </Button>
           </div>
           
           <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border rounded-lg p-3 shadow-sm flex items-center justify-between gap-2 overflow-hidden relative">
                <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-destructive/10 to-transparent flex items-center justify-center">
                   <AlertCircle className="h-10 w-10 text-destructive/20 translate-x-3" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Action Required</p>
                  <p className="text-xl font-display font-bold text-destructive">{overdueTasks.length} <span className="text-sm font-medium">Overdue</span></p>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-3 shadow-sm">
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Execution Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-display font-bold text-success">{completionRate}%</p>
                  <BarChart3 className="h-4 w-4 text-success opacity-50" />
                </div>
              </div>
           </div>
        </div>

        {/* Kanban / Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
           
           {/* Column 1: Overdue / Critical (status: Pending) */}
           <div 
             className="space-y-4"
             onDragOver={handleDragOver}
             onDrop={(e) => handleDrop(e, 'Pending')}
           >
             <div className="flex items-center justify-between border-b pb-2 border-destructive/20">
               <h3 className="font-bold text-sm text-destructive flex items-center gap-1.5"><AlertCircle className="h-4 w-4"/> Critical / Delayed</h3>
               <span className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
             </div>
             <div className="space-y-3">
               {overdueTasks.length === 0 ? <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/20 border-dashed border rounded">All clear</p> : null}
               {overdueTasks.map(t => <TaskCard key={t.id} task={t} />)}
             </div>
           </div>

           {/* Column 2: In Progress */}
           <div 
             className="space-y-4"
             onDragOver={handleDragOver}
             onDrop={(e) => handleDrop(e, 'In Progress')}
           >
             <div className="flex items-center justify-between border-b pb-2 border-blue-200">
               <h3 className="font-bold text-sm text-blue-700 flex items-center gap-1.5"><Clock className="h-4 w-4"/> In Progress</h3>
               <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
             </div>
             <div className="space-y-3">
               {inProgressTasks.length === 0 ? <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/20 border-dashed border rounded">Nothing active</p> : null}
               {inProgressTasks.map(t => <TaskCard key={t.id} task={t} />)}
             </div>
           </div>

           {/* Column 3: Pending */}
           <div 
             className="space-y-4"
             onDragOver={handleDragOver}
             onDrop={(e) => handleDrop(e, 'Pending')}
           >
             <div className="flex items-center justify-between border-b pb-2 border-slate-200">
               <h3 className="font-bold text-sm text-slate-700 flex items-center gap-1.5"><ListTodo className="h-4 w-4"/> To-Do Pipeline</h3>
               <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
             </div>
             <div className="space-y-3">
               {pendingTasks.length === 0 ? <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/20 border-dashed border rounded">Queue empty</p> : null}
               {pendingTasks.map(t => <TaskCard key={t.id} task={t} />)}
             </div>
           </div>

           {/* Column 4: Recently Completed */}
           <div 
             className="space-y-4 md:col-span-full xl:col-span-1 border-t xl:border-t-0 xl:border-l pt-6 xl:pt-0 xl:pl-6"
             onDragOver={handleDragOver}
             onDrop={(e) => handleDrop(e, 'Completed')}
           >
             <div className="flex items-center justify-between border-b pb-2 border-emerald-200">
               <h3 className="font-bold text-sm text-emerald-700 flex items-center gap-1.5"><Archive className="h-4 w-4"/> Recently Finished</h3>
               <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{completedTasks.length}</span>
             </div>
             <div className="space-y-3 opacity-70">
               {completedTasks.length === 0 ? <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/20 border-dashed border rounded">No closed tasks</p> : null}
               {completedTasks.map(t => (
                 <div key={t.id} className="p-3 border rounded-lg bg-emerald-50/30 flex items-start gap-2">
                   <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                   <div>
                     <p className="text-xs font-semibold line-through">{t.title}</p>
                     <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
                       Closed by {t.assignedTo} on {new Date(t.completedAt!).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
           </div>

        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onClick={() => setPage(i + 1)}
                      isActive={page === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <CreateTaskModal 
        open={isTaskModalOpen} 
        onOpenChange={setIsTaskModalOpen} 
        onComplete={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })} 
      />
    </AppLayout>
  );
}
