import { 
  Briefcase, 
  Calendar, 
  FileText, 
  CheckSquare, 
  StickyNote, 
  Clock, 
  User, 
  MapPin, 
  Gavel,
  Plus,
  ArrowLeft,
  Activity,
  ChevronRight,
  Loader2,
  Trash2,
  Edit3,
  Save,
  X,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { caseService } from "@/services/caseService";
import { courtService } from "@/services/courtService";
import { documentService } from "@/services/documentService";
import { taskService } from "@/services/taskService";
import { noteService, CaseNote } from "@/services/noteService";
import { calculateHealthScore } from "@/utils/caseUtils";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { CreateHearingModal } from "@/components/CreateHearingModal";
import { UpdateHearingModal } from "@/components/UpdateHearingModal";
import { formatDate, formatTime } from "@/utils/formatters";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: caseData, isLoading: loadingCase, error: caseError } = useQuery({
    queryKey: ['case', id],
    queryFn: () => caseService.getCaseById(id || ''),
    enabled: !!id
  });

  const queryClient = useQueryClient();
  const [updateHearingId, setUpdateHearingId] = useState<string | null>(null);
  const [isAddHearingOpen, setIsAddHearingOpen] = useState(false);
  const [hearingPage, setHearingPage] = useState(1);
  const [docPage, setDocPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);
  const pageSize = 10;

  // Task CRUD state
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  // Notes CRUD state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  const { data: hearingsResponse, isLoading: loadingHearings } = useQuery({
    queryKey: ['hearings', id, hearingPage],
    queryFn: () => courtService.getHearingsByCase(id || '', hearingPage, pageSize),
    enabled: !!id
  });
  const hearings = hearingsResponse?.data || [];
  const totalHearings = hearingsResponse?.totalCount || 0;
  const totalHearingPages = Math.ceil(totalHearings / pageSize);

  const { data: docsResponse, isLoading: loadingDocs } = useQuery({
    queryKey: ['documents', id, docPage],
    queryFn: () => documentService.getDocumentsByCase(id || '', docPage, pageSize),
    enabled: !!id
  });
  const documents = docsResponse?.data || [];
  const totalDocs = docsResponse?.totalCount || 0;
  const totalDocPages = Math.ceil(totalDocs / pageSize);

  const { data: tasksResponse, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', id, taskPage],
    queryFn: () => taskService.getTasksByCase(id || '', taskPage, pageSize),
    enabled: !!id
  });
  const tasks = tasksResponse?.data || [];
  const totalTasks = tasksResponse?.totalCount || 0;
  const totalTaskPages = Math.ceil(totalTasks / pageSize);

  const { data: timeline = [], isLoading: loadingTimeline } = useQuery({
    queryKey: ['timeline', id],
    queryFn: async () => {
      // Auto-generate timeline from hearings, documents, and case data
      const entries: Array<{ id: string; title: string; date: string; type: string; description?: string }> = [];

      // Case creation entry
      if (caseData?.created_at) {
        entries.push({
          id: 'case-created',
          title: 'Case Filed',
          date: caseData.created_at,
          type: 'StatusChange',
          description: `${caseData.title} was registered at ${caseData.court || 'the court'}.`
        });
      }

      // Hearing entries
      if (hearings.length > 0) {
        hearings.forEach((h: any) => {
          entries.push({
            id: `hearing-${h.id}`,
            title: `${h.stage || 'Hearing'} — ${h.status}`,
            date: h.date,
            type: 'HearingUpdate',
            description: h.outcome || `Hearing at ${h.court || caseData?.court || 'Court'}`
          });
        });
      }

      // Document entries
      if (documents.length > 0) {
        documents.forEach((doc: any) => {
          entries.push({
            id: `doc-${doc.id}`,
            title: `Document Added: ${doc.title || doc.fileName || doc.name || 'File'}`,
            date: doc.created_at || doc.createdAt || doc.uploadedAt || new Date().toISOString(),
            type: 'DocumentAdded',
            description: `Document uploaded to case records.`
          });
        });
      }

      // Sort by date descending
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return entries;
    },
    enabled: !!id && !!caseData && !loadingHearings && !loadingDocs
  });

  // Notes query
  const { data: notes = [], isLoading: loadingNotes } = useQuery({
    queryKey: ['case-notes', id],
    queryFn: () => noteService.getNotesByCase(id || ''),
    enabled: !!id,
    retry: false // Don't retry if table doesn't exist
  });

  // Task mutations
  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => taskService.createTask(taskData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', id] }); toast.success('Task created'); setShowAddTask(false); setNewTaskTitle(''); setNewTaskDueDate(''); },
    onError: () => toast.error('Failed to create task')
  });
  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => taskService.updateTaskStatus(taskId, status as any),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', id] }); toast.success('Task updated'); },
    onError: () => toast.error('Failed to update task')
  });
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) => taskService.updateTask(taskId, { title }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', id] }); setEditingTaskId(null); toast.success('Task updated'); },
    onError: () => toast.error('Failed to update task')
  });
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', id] }); toast.success('Task deleted'); },
    onError: () => toast.error('Failed to delete task')
  });

  // Note mutations
  const createNoteMutation = useMutation({
    mutationFn: (content: string) => noteService.createNote(id || '', content),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['case-notes', id] }); setNewNoteContent(''); toast.success('Note saved'); },
    onError: () => toast.error('Failed to save note. Ensure the case_notes table exists in Supabase.')
  });
  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) => noteService.updateNote(noteId, content),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['case-notes', id] }); setEditingNoteId(null); toast.success('Note updated'); },
    onError: () => toast.error('Failed to update note')
  });
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => noteService.deleteNote(noteId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['case-notes', id] }); toast.success('Note deleted'); },
    onError: () => toast.error('Failed to delete note')
  });
  
  const isLoading = loadingCase || loadingHearings || loadingDocs || loadingTasks || loadingTimeline;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading Case Details...</p>
        </div>
      </AppLayout>
    );
  }

  if (!caseData || caseError) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium text-muted-foreground">Case not found</p>
          <Button variant="link" onClick={() => navigate("/cases")}>Go back to cases</Button>
        </div>
      </AppLayout>
    );
  }

  const healthScore = calculateHealthScore(caseData);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => navigate("/cases")} className="h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Cases
          </Button>
          <span>/</span>
          <span className="font-mono">{caseData.caseNumber || caseData.id}</span>
        </div>

        {/* Case Info Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold tracking-tight">{caseData.title}</h1>
              <StatusBadge status={caseData.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>{caseData.type}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{caseData.court}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Filed: {formatDate(caseData.filingDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">Health Score</p>
              <p className="text-xl font-display font-bold text-primary">{healthScore}%</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Activity className={`h-6 w-6 ${healthScore > 80 ? 'text-green-500' : healthScore > 50 ? 'text-yellow-500' : 'text-red-500'}`} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 w-full justify-start overflow-x-auto h-auto">
            <TabsTrigger value="overview" className="gap-2 py-2"><Activity className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="hearings" className="gap-2 py-2"><Gavel className="h-4 w-4" /> Hearings</TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 py-2"><FileText className="h-4 w-4" /> Documents</TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2 py-2"><CheckSquare className="h-4 w-4" /> Tasks</TabsTrigger>
            <TabsTrigger value="notes" className="gap-2 py-2"><StickyNote className="h-4 w-4" /> Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stakeholders & Details */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parties & Stakeholders</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Plaintiff / Petitioner</p>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{(caseData as any).client?.name || "Unknown Client"}</p>
                            <p className="text-xs text-muted-foreground">Main Client · {(caseData as any).client?.type || 'Individual'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Respondent / Opposing Party</p>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{(caseData as any).opponent || "Not Specified"}</p>
                            <p className="text-xs text-muted-foreground">Opposing Party</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Primary Advocate</p>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{(caseData as any).lawyer?.name || "Unassigned"}</p>
                            <p className="text-xs text-muted-foreground">Lead Counsel · {(caseData as any).lawyer?.email || ''}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Case Reference</p>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium font-mono text-sm">{caseData.caseNumber || caseData.id?.substring(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">{caseData.type} Case · Filed {formatDate(caseData.filingDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Judicial Information</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                          <MapPin className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Court / Forum</p>
                            <p className="font-medium text-sm">{caseData.court || 'Not Assigned'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                          <Gavel className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Case Status</p>
                            <p className="font-medium text-sm">{caseData.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Next Hearing</p>
                            <p className="font-medium text-sm">{hearings.filter(h => h.status === 'Upcoming')[0] ? formatDate(hearings.filter(h => h.status === 'Upcoming')[0].date) : 'None Scheduled'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Case Timeline */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Case Timeline</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="relative space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                      {timeline.length > 0 ? timeline.map((item, idx) => (
                        <div key={item.id} className="relative pl-10">
                          <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
                            item.type === 'StatusChange' ? 'bg-blue-500' : 
                            item.type === 'HearingUpdate' ? 'bg-amber-500' : 
                            item.type === 'DocumentAdded' ? 'bg-green-500' : 'bg-purple-500'
                          }`}>
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.date)} · {formatTime(item.date)}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-2 rounded border border-dashed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">No timeline entries recorded yet.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Quick Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Client Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(caseData as any).client ? (
                      <div>
                        <p className="font-bold text-lg">{(caseData as any).client.name}</p>
                        <p className="text-sm text-muted-foreground">{(caseData as any).client.type} Client</p>
                        <div className="mt-4 space-y-2">
                          <p className="text-xs truncate">{(caseData as any).client.email}</p>
                          <p className="text-xs">{(caseData as any).client.phone}</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate(`/clients/${(caseData as any).client.id}`)}>View Full Client Profile</Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Client information not available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm uppercase tracking-widest opacity-80">Next Hearing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hearings.filter(h => h.status === 'Upcoming').length > 0 ? (
                      <div>
                        <p className="text-2xl font-bold font-display">
                          {formatDate(hearings.filter(h => h.status === 'Upcoming')[0].date, { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm opacity-90">{hearings.filter(h => h.status === 'Upcoming')[0].stage}</p>
                        <Button variant="secondary" size="sm" className="w-full mt-4" onClick={() => navigate('/calendar')}>Open Calendar</Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm opacity-90">
                          {['Closed', 'Won', 'Lost', 'Settled', 'Withdrawn'].includes(caseData.status) 
                            ? "Case Finalized — No hearings scheduled." 
                            : "No upcoming hearing scheduled."}
                        </p>
                        {!['Closed', 'Won', 'Lost', 'Settled', 'Withdrawn'].includes(caseData.status) && (
                          <Button variant="secondary" size="sm" className="w-full mt-4" onClick={() => setIsAddHearingOpen(true)}>Schedule Now</Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Hearings Tab Content */}
          <TabsContent value="hearings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Hearing History</h2>
              {!['Closed', 'Won', 'Lost', 'Settled', 'Withdrawn'].includes(caseData.status) && (
                <Button onClick={() => setIsAddHearingOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Hearing
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {hearings.length > 0 ? hearings.map((h) => (
                <Card key={h.id} className={`${h.status === 'Upcoming' ? 'border-l-4 border-l-blue-500' : 'bg-muted/20'}`}>
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-3 text-center min-w-[70px] ${h.status === 'Upcoming' ? 'bg-blue-50 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                        <p className="text-[10px] font-bold uppercase">{formatDate(h.date, { month: 'short' })}</p>
                        <p className="text-xl font-bold font-display">{new Date(h.date).getDate()}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <StatusBadge status={h.status} />
                           <span className="text-xs text-muted-foreground">{h.stage}</span>
                        </div>
                        <p className="font-semibold">{formatTime(h.date)} · {h.court}</p>
                        {h.outcome && (
                           <p className="text-sm mt-2 text-muted-foreground italic border-l-2 pl-3 py-1 bg-muted/10"><strong>Outcome:</strong> {h.outcome}</p>
                        )}
                        {h.notes && h.status === 'Completed' && (
                           <div className="mt-2 text-xs text-muted-foreground bg-muted/5 p-2 rounded whitespace-pre-wrap">
                             <strong>Notes:</strong> {h.notes}
                           </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col gap-2">
                       {h.status === 'Upcoming' && caseData.status !== 'Closed' && caseData.status !== 'Won' && caseData.status !== 'Lost' && caseData.status !== 'Settled' && (
                         <Button variant="outline" size="sm" onClick={() => setUpdateHearingId(h.id)}>Update Result</Button>
                       )}
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
                  <Gavel className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-3" />
                  <p className="text-muted-foreground font-medium">No hearings recorded for this case.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddHearingOpen(true)}>Add Initial Hearing</Button>
                </div>
              )}
            </div>

            {totalHearingPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setHearingPage(p => Math.max(1, p - 1))}
                        className={hearingPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalHearingPages, 5) }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setHearingPage(i + 1)}
                          isActive={hearingPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setHearingPage(p => Math.min(totalHearingPages, p + 1))}
                        className={hearingPage === totalHearingPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>

          {/* Placeholder Tabs */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Documents & Files</h2>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Upload Doc
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {documents.map(doc => (
                 <Card key={doc.id} className="group hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                       <div className="h-10 w-10 rounded bg-red-50 flex items-center justify-center text-red-600">
                         <FileText className="h-6 w-6" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-medium truncate">{doc.fileName}</p>
                         <p className="text-[10px] text-muted-foreground uppercase">{doc.fileType} · {formatDate(doc.uploadedAt)}</p>
                       </div>
                       <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                 </Card>
               ))}
                {documents.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">No documents found for this case.</div>
                )}
             </div>

             {totalDocPages > 1 && (
               <div className="mt-8 flex justify-center">
                 <Pagination>
                   <PaginationContent>
                     <PaginationItem>
                       <PaginationPrevious 
                         onClick={() => setDocPage(p => Math.max(1, p - 1))}
                         className={docPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                       />
                     </PaginationItem>
                     {Array.from({ length: Math.min(totalDocPages, 5) }).map((_, i) => (
                       <PaginationItem key={i}>
                         <PaginationLink 
                           onClick={() => setDocPage(i + 1)}
                           isActive={docPage === i + 1}
                           className="cursor-pointer"
                         >
                           {i + 1}
                         </PaginationLink>
                       </PaginationItem>
                     ))}
                     <PaginationItem>
                       <PaginationNext 
                         onClick={() => setDocPage(p => Math.min(totalDocPages, p + 1))}
                         className={docPage === totalDocPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                       />
                     </PaginationItem>
                   </PaginationContent>
                 </Pagination>
               </div>
             )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Tasks & Deadlines</h2>
              <Button onClick={() => setShowAddTask(!showAddTask)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </div>

            {/* Add Task Form */}
            {showAddTask && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Input
                      type="date"
                      value={newTaskDueDate}
                      onChange={e => setNewTaskDueDate(e.target.value)}
                      className="flex-1"
                    />
                    <select
                      value={newTaskPriority}
                      onChange={e => setNewTaskPriority(e.target.value as any)}
                      className="border rounded-md px-3 text-sm bg-white"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setShowAddTask(false)}>Cancel</Button>
                    <Button
                      size="sm"
                      disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
                      onClick={() => createTaskMutation.mutate({
                        title: newTaskTitle,
                        case_id: id,
                        priority: newTaskPriority,
                        due_date: newTaskDueDate || new Date().toISOString(),
                        status: 'Pending',
                        assigned_to: (caseData as any).lawyer?.id || null,
                        created_by: (caseData as any).lawyer?.id || null
                      })}
                    >
                      {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
               {tasks.map((task) => (
                 <Card key={task.id} className={`transition-all ${task.status === 'Completed' ? 'bg-muted/20 opacity-70' : ''}`}>
                   <CardContent className="p-4 flex items-center gap-3">
                    <button
                      onClick={() => toggleTaskMutation.mutate({ taskId: task.id, status: task.status === 'Completed' ? 'Pending' : 'Completed' })}
                      className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${task.status === 'Completed' ? 'bg-primary border-primary text-white' : 'bg-white border-muted-foreground/30 hover:border-primary'}`}
                    >
                       {task.status === 'Completed' && <CheckSquare className="h-3 w-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      {editingTaskId === task.id ? (
                        <div className="flex items-center gap-2">
                          <Input value={editingTaskTitle} onChange={e => setEditingTaskTitle(e.target.value)} className="h-8 text-sm" autoFocus />
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => updateTaskMutation.mutate({ taskId: task.id, title: editingTaskTitle })}><Save className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingTaskId(null)}><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <>
                          <span className={`text-sm ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'font-medium'}`}>{task.title}</span>
                          {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        task.priority === 'High' ? 'bg-red-100 text-red-700' :
                        task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>{task.priority}</span>
                      <span className="text-xs text-muted-foreground">{task.status === 'Completed' ? 'Done' : formatDate(task.dueDate)}</span>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingTaskId(task.id); setEditingTaskTitle(task.title); }}><Edit3 className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => { if (confirm('Delete this task?')) deleteTaskMutation.mutate(task.id); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                   </CardContent>
                 </Card>
               ))}
                {tasks.length === 0 && (
                  <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
                    <CheckSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-3" />
                    <p className="text-muted-foreground font-medium">No tasks assigned to this case.</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddTask(true)}>Create First Task</Button>
                  </div>
                )}
             </div>

             {totalTaskPages > 1 && (
               <div className="mt-8 flex justify-center">
                 <Pagination>
                   <PaginationContent>
                     <PaginationItem>
                       <PaginationPrevious 
                         onClick={() => setTaskPage(p => Math.max(1, p - 1))}
                         className={taskPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                       />
                     </PaginationItem>
                     {Array.from({ length: Math.min(totalTaskPages, 5) }).map((_, i) => (
                       <PaginationItem key={i}>
                         <PaginationLink 
                           onClick={() => setTaskPage(i + 1)}
                           isActive={taskPage === i + 1}
                           className="cursor-pointer"
                         >
                           {i + 1}
                         </PaginationLink>
                       </PaginationItem>
                     ))}
                     <PaginationItem>
                       <PaginationNext 
                         onClick={() => setTaskPage(p => Math.min(totalTaskPages, p + 1))}
                         className={taskPage === totalTaskPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                       />
                     </PaginationItem>
                   </PaginationContent>
                 </Pagination>
               </div>
             )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Internal Notes</h2>
              <span className="text-xs text-muted-foreground">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Add Note Form */}
            <Card className="border-accent/30">
              <CardContent className="p-0">
                <textarea 
                  className="w-full h-28 p-4 text-sm resize-none focus:outline-none bg-transparent"
                  placeholder="Write a private note for your legal team..."
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                />
                <div className="border-t p-2 flex justify-end">
                  <Button
                    size="sm"
                    disabled={!newNoteContent.trim() || createNoteMutation.isPending}
                    onClick={() => createNoteMutation.mutate(newNoteContent)}
                  >
                    {createNoteMutation.isPending ? 'Saving...' : 'Save Note'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes List */}
            <div className="space-y-3">
              {notes.map((note: CaseNote) => (
                <Card key={note.id} className="group">
                  <CardContent className="p-4">
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full h-24 p-3 text-sm resize-none border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={editingNoteContent}
                          onChange={e => setEditingNoteContent(e.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => updateNoteMutation.mutate({ noteId: note.id, content: editingNoteContent })}>
                            {updateNoteMutation.isPending ? 'Saving...' : 'Update'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {note.updatedAt !== note.createdAt && ' · edited'}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingNoteId(note.id); setEditingNoteContent(note.content); }}><Edit3 className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => { if (confirm('Delete this note?')) deleteNoteMutation.mutate(note.id); }}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
                  <StickyNote className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-3" />
                  <p className="text-muted-foreground font-medium">No notes yet for this case.</p>
                  <p className="text-xs text-muted-foreground mt-1">Add your first note above to get started.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateHearingModal 
          isOpen={isAddHearingOpen} 
          onClose={() => setIsAddHearingOpen(false)} 
          defaultCaseId={id}
        />

        <UpdateHearingModal 
          isOpen={!!updateHearingId} 
          onClose={() => setUpdateHearingId(null)} 
          hearingId={updateHearingId}
        />
      </div>
    </AppLayout>
  );
}
