import { AppLayout } from "@/components/AppLayout";
import { useParams, useNavigate } from "react-router-dom";
import { mockCRMClients, mockCommunications, mockCases, mockDocuments } from "@/store/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogCommunicationModal } from "@/components/LogCommunicationModal";
import {
  ArrowLeft, Phone, Mail, MapPin, Building, Activity,
  Calendar, FileText, PhoneCall, CheckCircle2,
  Clock, Link2, ExternalLink, MessageSquarePlus, PieChart, Briefcase
} from "lucide-react";
import { useState } from "react";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = mockCRMClients.find(c => c.id === id);
  const [logModalOpen, setLogModalOpen] = useState(false);

  if (!client) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl font-medium">Client not found</p>
          <Button variant="link" onClick={() => navigate('/clients')}>Back to Clients</Button>
        </div>
      </AppLayout>
    );
  }

  // Get related data
  const clientComms = mockCommunications.filter(c => c.clientId === client.id);
  const linkedCases = mockCases.filter(c => client.linkedCaseIds.includes(c.id));
  const clientDocs = mockDocuments.filter(d => 
    linkedCases.some(c => c.id === d.caseId)
  );

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const commIcons = {
    Call: <PhoneCall className="h-4 w-4" />,
    Email: <Mail className="h-4 w-4" />,
    Meeting: <Building className="h-4 w-4" />,
    WhatsApp: <MessageSquarePlus className="h-4 w-4" />
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Nav & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')} className="shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Client Profile 360</p>
            <h1 className="text-2xl font-display font-semibold tracking-tight truncate flex items-center gap-2">
              {client.name}
              {client.status === 'VIP' && <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 shadow-sm">VIP Client</Badge>}
            </h1>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" className="gap-2 shrink-0">
              <ExternalLink className="h-4 w-4" /> Client Portal
            </Button>
            <Button onClick={() => setLogModalOpen(true)} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 shadow-sm">
              <MessageSquarePlus className="h-4 w-4" /> Log Interaction
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sidebar Profile */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-5 flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-display font-bold text-primary mb-3 shadow-inner">
                  {client.avatar}
                </div>
                <h2 className="text-lg font-bold">{client.name}</h2>
                <div className="flex items-center gap-1.5 justify-center mt-1">
                  <Badge variant="outline" className="text-[10px] font-medium tracking-wide bg-background">{client.type}</Badge>
                  <Badge variant="outline" className="text-[10px] font-medium tracking-wide bg-background">Since {client.since}</Badge>
                </div>
                
                <div className={`mt-5 w-full flex items-center justify-between p-3 rounded-lg border ${getHealthColor(client.healthScore)}`}>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Health Score</span>
                  </div>
                  <span className="font-display font-bold">{client.healthScore}/100</span>
                </div>

                <div className="w-full space-y-3 mt-6 text-sm text-left">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground break-all">{client.email}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{client.phone}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground leading-snug">{client.address}</span>
                    </div>
                  )}
                </div>

                {client.tags.length > 0 && (
                  <div className="w-full mt-6 pt-5 border-t text-left">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {client.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] font-medium">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {client.notes && (
              <Card className="border-amber-100 bg-amber-50/50">
                <CardHeader className="py-3 px-4 pb-2">
                  <CardTitle className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" /> Internal Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-sm text-amber-900/80 leading-relaxed italic">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Main Content Area */}
          <div className="lg:col-span-9">
            <Tabs defaultValue="overview" className="w-full">
              <div className="bg-background sticky top-0 z-10 pb-4">
                <TabsList className="grid grid-cols-4 w-[500px]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="billing">Billing Info</TabsTrigger>
                </TabsList>
              </div>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Cases</p>
                        <p className="text-2xl font-display font-bold">{linkedCases.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <MessageSquarePlus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interactions</p>
                        <p className="text-2xl font-display font-bold">{clientComms.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Shared Docs</p>
                        <p className="text-2xl font-display font-bold">{clientDocs.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Linked Cases */}
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="py-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> Associated Cases
                    </CardTitle>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => navigate('/cases/new')}>
                      <Link2 className="h-3 w-3" /> New Case
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {linkedCases.map(c => (
                        <div key={c.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/cases/${c.id}`)}>
                          <div>
                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">{c.title}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <span className="font-mono">{c.caseNumber || c.id}</span>
                              <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {c.court}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-background">{c.status}</Badge>
                        </div>
                      ))}
                      {linkedCases.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          No cases assigned to this client yet.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Interactions Preview */}
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="py-4 border-b bg-muted/20">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> Recent Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y text-sm">
                      {clientComms.slice(0, 3).map(comm => (
                        <div key={comm.id} className="p-4 flex gap-4">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            {commIcons[comm.type] || <MessageSquarePlus className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{comm.summary}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(comm.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              {' · '}by {comm.loggedBy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TIMELINE TAB */}
              <TabsContent value="timeline" className="mt-0">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="py-4 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" /> Communication Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
                      {clientComms.length > 0 ? clientComms.map((comm, i) => (
                        <div key={comm.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm">
                            {commIcons[comm.type]}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border shadow-sm rounded-xl p-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold uppercase tracking-widest text-[#DBA859]">{comm.type}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {new Date(comm.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold">{comm.summary}</h4>
                            {comm.notes && (
                              <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded-md">
                                {comm.notes}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t text-[10px]">
                              <span className="text-muted-foreground">Logged by <span className="font-medium text-foreground">{comm.loggedBy}</span></span>
                              {comm.followUpDate && (
                                <span className="flex items-center gap-1 text-primary">
                                  <Calendar className="h-3 w-3" /> F/U: {new Date(comm.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-10 text-muted-foreground text-sm z-10 relative bg-card">
                          No communication logged yet.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DOCUMENTS TAB */}
              <TabsContent value="documents" className="mt-0">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Client Documents</CardTitle>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => navigate('/documents')}>
                      <ExternalLink className="h-3 w-3" /> Document Center
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {clientDocs.map(doc => (
                        <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{doc.fileName}</p>
                              <p className="text-xs text-muted-foreground">{doc.documentType} · Added {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="font-mono text-[10px]">{doc.caseId}</Badge>
                        </div>
                      ))}
                      {clientDocs.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">No documents shared with this client.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* BILLING TAB */}
              <TabsContent value="billing" className="mt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="border-border/60 shadow-sm bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-6">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <PieChart className="h-3.5 w-3.5" /> Total Billed
                      </p>
                      <p className="text-3xl font-display font-bold mt-2">₹{client.totalBilled.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className={`border-border/60 shadow-sm bg-gradient-to-br ${client.outstandingAmount > 0 ? 'from-amber-50 to-orange-50/20 border-amber-200' : 'from-green-50 to-emerald-50/20 border-green-200'}`}>
                    <CardContent className="p-6">
                      <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${client.outstandingAmount > 0 ? 'text-amber-800' : 'text-green-800'}`}>
                        <Activity className="h-3.5 w-3.5" /> Outstanding Amount
                      </p>
                      <p className={`text-3xl font-display font-bold mt-2 ${client.outstandingAmount > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                        ₹{client.outstandingAmount.toLocaleString()}
                      </p>
                      {client.outstandingAmount === 0 && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Fully paid</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-10">
                  <ExternalLink className="h-4 w-4" /> Go to Billing Module
                </Button>
              </TabsContent>

            </Tabs>
          </div>
        </div>

        {/* Modal */}
        <LogCommunicationModal 
          isOpen={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          clientId={client.id}
          defaultCaseId={linkedCases[0]?.id}
        />
      </div>
    </AppLayout>
  );
}
