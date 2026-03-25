import { AppLayout } from "@/components/AppLayout";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ChevronRight
} from "lucide-react";
import { mockCases, mockHearings, mockClients, mockTimeline, calculateHealthScore } from "@/store/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { CreateHearingModal } from "@/components/CreateHearingModal";
import { UpdateHearingModal } from "@/components/UpdateHearingModal";

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAddHearingOpen, setIsAddHearingOpen] = useState(false);
  const [updateHearingId, setUpdateHearingId] = useState<string | null>(null);

  const caseData = mockCases.find(c => c.id === id);
  const client = mockClients.find(cli => cli.id === caseData?.clientId);
  const hearings = mockHearings.filter(h => h.caseId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const caseTimeline = mockTimeline.filter(t => t.caseId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (!caseData) {
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
                <span>Filed: {new Date(caseData.filingDate).toLocaleDateString()}</span>
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
                            <p className="font-medium">{caseData.opponent.petitioner}</p>
                            <p className="text-xs text-muted-foreground">Main Client</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Respondent</p>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{caseData.opponent.respondent}</p>
                            <p className="text-xs text-muted-foreground">Opposing Party</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Our Team</p>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Adv. Kumar</p>
                            <p className="text-xs text-muted-foreground">Primary Lawyer</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Opposing Counsel</p>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{caseData.opponent.opposingLawyer}</p>
                            <p className="text-xs text-muted-foreground">Opposing Lawyer</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Judicial Info</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Gavel className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Judge</p>
                            <p className="font-medium">{caseData.opponent.judge || "Not Assigned"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Jurisdiction</p>
                            <p className="font-medium">{caseData.court}</p>
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
                      {caseTimeline.length > 0 ? caseTimeline.map((item, idx) => (
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
                            <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.date).toLocaleDateString()} · {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                    {client ? (
                      <div>
                        <p className="font-bold text-lg">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.type} Client</p>
                        <div className="mt-4 space-y-2">
                          <p className="text-xs truncate">{client.email}</p>
                          <p className="text-xs">{client.phone}</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-4">View Full Client Profile</Button>
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
                          {new Date(hearings.filter(h => h.status === 'Upcoming')[0].date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm opacity-90">{hearings.filter(h => h.status === 'Upcoming')[0].stage}</p>
                        <Button variant="secondary" size="sm" className="w-full mt-4" onClick={() => navigate('/calendar')}>Open Calendar</Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm opacity-90">No upcoming hearing scheduled.</p>
                        <Button variant="secondary" size="sm" className="w-full mt-4" onClick={() => setIsAddHearingOpen(true)}>Schedule Now</Button>
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
              <Button onClick={() => setIsAddHearingOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Hearing
              </Button>
            </div>

            <div className="space-y-4">
              {hearings.length > 0 ? hearings.map((h) => (
                <Card key={h.id} className={`${h.status === 'Upcoming' ? 'border-l-4 border-l-blue-500' : 'bg-muted/20'}`}>
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-3 text-center min-w-[70px] ${h.status === 'Upcoming' ? 'bg-blue-50 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                        <p className="text-[10px] font-bold uppercase">{new Date(h.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                        <p className="text-xl font-bold font-display">{new Date(h.date).getDate()}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <StatusBadge status={h.status} />
                           <span className="text-xs text-muted-foreground">{h.stage}</span>
                        </div>
                        <p className="font-semibold">{new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {h.court}</p>
                        {h.outcome && (
                           <p className="text-sm mt-2 text-muted-foreground italic border-l-2 pl-3 py-1 bg-muted/10">"{h.outcome}"</p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex gap-2">
                       {h.status === 'Upcoming' && (
                         <Button variant="outline" size="sm" onClick={() => setUpdateHearingId(h.id)}>Update Result</Button>
                       )}
                       <Button variant="ghost" size="sm">Details</Button>
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
               {[1, 2, 3].map(i => (
                 <Card key={i} className="group hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                       <div className="h-10 w-10 rounded bg-red-50 flex items-center justify-center text-red-600">
                         <FileText className="h-6 w-6" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-medium truncate">Legal_Petition_V{i}.pdf</p>
                         <p className="text-[10px] text-muted-foreground uppercase">PDF · 2.4 MB · 2 days ago</p>
                       </div>
                       <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                 </Card>
               ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <h2 className="text-xl font-bold">Tasks & Deadlines</h2>
            <div className="space-y-3">
               {[
                 { title: "Review opposing witness list", due: "Tomorrow" },
                 { title: "Draft rejoinder for IP clause", due: "March 25, 2026" },
                 { title: "Client sign-off on affidavit", due: "Completed" }
               ].map((task, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                    <div className={`h-5 w-5 rounded border flex items-center justify-center ${task.due === 'Completed' ? 'bg-primary border-primary text-white' : 'bg-white border-muted'}`}>
                       {task.due === 'Completed' && <CheckSquare className="h-3 w-3" />}
                    </div>
                    <span className={`text-sm ${task.due === 'Completed' ? 'line-through text-muted-foreground' : 'font-medium'}`}>{task.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{task.due}</span>
                 </div>
               ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <h2 className="text-xl font-bold">Internal Notes</h2>
            <Card>
              <CardContent className="p-0">
                <textarea 
                  className="w-full h-32 p-4 text-sm resize-none focus:outline-none bg-transparent"
                  placeholder="Add a private note for your legal team..."
                />
                <div className="border-t p-2 flex justify-end">
                  <Button size="sm">Save Note</Button>
                </div>
              </CardContent>
            </Card>
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
