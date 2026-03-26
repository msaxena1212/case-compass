import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { clientService } from "@/services/clientService";
import { documentService } from "@/services/documentService";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogCommunicationModal } from "@/components/LogCommunicationModal";
import {
  ArrowLeft, Phone, Mail, MapPin, Building, Activity,
  Calendar, FileText, PhoneCall, CheckCircle2,
  Clock, Link2, ExternalLink, MessageSquarePlus, PieChart, Briefcase,
  Loader2, Trash2, Eye, Upload, UserPlus, Users
} from "lucide-react";
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { billingService } from "@/services/billingService";
import { UploadDocumentModal } from "@/components/UploadDocumentModal";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AddSubClientModal } from "@/components/AddSubClientModal";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: client, isLoading: loadingClient, error: clientError } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getClientById(id || ''),
    enabled: !!id
  });

  const [commPage, setCommPage] = useState(1);
  const [docPage, setDocPage] = useState(1);
  const pageSize = 10;

  const { data: commsResponse, isLoading: loadingComm } = useQuery({
    queryKey: ['communications', id, commPage],
    queryFn: () => clientService.getCommunications(id || '', commPage, pageSize),
    enabled: !!id
  });
  const clientComms = commsResponse?.data || [];
  const totalComms = commsResponse?.totalCount || 0;
  const totalCommPages = Math.ceil(totalComms / pageSize);

  const { data: docsResponse, isLoading: loadingDocs } = useQuery({
    queryKey: ['documents', id, docPage],
    queryFn: () => documentService.getDocumentsByClient(id || '', docPage, pageSize),
    enabled: !!id
  });
  const clientDocs = docsResponse?.data || [];
  const totalDocs = docsResponse?.totalCount || 0;
  const totalDocPages = Math.ceil(totalDocs / pageSize);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [addSubClientOpen, setAddSubClientOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: invoicesResponse, isLoading: loadingInvoices } = useQuery({
    queryKey: ['client-invoices', id],
    queryFn: () => billingService.getAllInvoices(1, 100), // Adjust if needed
    enabled: !!id
  });
  const clientInvoices = (invoicesResponse?.data || []).filter(i => i.clientId === id);
  
  const billingTotals = useMemo(() => {
    const total = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const outstanding = clientInvoices
      .filter(inv => inv.status !== 'Paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    return { total, outstanding };
  }, [clientInvoices]);

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) => documentService.deleteDocument(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
      toast.success("Document deleted");
    },
    onError: (err: any) => toast.error(`Delete failed: ${err.message}`)
  });

  // Sub-clients query
  const { data: subClients = [], isLoading: loadingSubClients } = useQuery({
    queryKey: ['sub-clients', id],
    queryFn: () => clientService.getSubClients(id || ''),
    enabled: !!id
  });

  const isLoading = loadingClient || loadingComm || loadingDocs;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading Client Details...</p>
        </div>
      </AppLayout>
    );
  }

  if (!client || clientError) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-xl font-medium">Client not found</p>
          <Button variant="link" onClick={() => navigate('/clients')}>Back to Clients</Button>
        </div>
      </AppLayout>
    );
  }

  // Get related data (filtered from live queries or joined in service)
  const linkedCases = client.cases || [];

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
                  {(client as any).avatarUrl ? (
                    <img src={(client as any).avatarUrl} alt={client.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    client.name.split(' ').map((n: string) => n[0]).join('')
                  )}
                </div>
                <h2 className="text-lg font-bold">{client.name}</h2>
                <div className="flex items-center gap-1.5 justify-center mt-1">
                  <Badge variant="outline" className="text-[10px] font-medium tracking-wide bg-background">{client.type}</Badge>
                  <Badge variant="outline" className="text-[10px] font-medium tracking-wide bg-background">Since {new Date(client.createdAt).getFullYear()}</Badge>
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
              <TabsList className="grid grid-cols-5 w-[620px]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sub-clients">Sub-Clients ({subClients.length})</TabsTrigger>
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
                      {(client as any).cases.map((c: any) => (
                        <div key={c.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/cases/${c.id}`)}>
                          <div>
                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">{c.title}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <span className="font-mono">{c.caseNumber || c.id.split('-')[0]}</span>
                              <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {c.court || "N/A"}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-background">{c.status}</Badge>
                        </div>
                      ))}
                      {(client as any).cases.length === 0 && (
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
                      {clientComms.length > 0 ? clientComms.slice(0, 3).map(comm => (
                        <div key={comm.id} className="p-4 flex gap-4">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            {commIcons[comm.type] || <MessageSquarePlus className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{comm.summary}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(comm.date, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' } as any)}
                              {' · '}by {comm.loggedBy}
                            </p>
                          </div>
                        </div>
                      )) : (
                        /* Sample Data when empty */
                        [
                          { id: 's1', type: 'Call', summary: 'Initial consultation regarding property dispute', date: new Date(Date.now() - 86400000 * 2).toISOString(), loggedBy: 'Adv. Kumar' },
                          { id: 's2', type: 'Email', summary: 'Sent case engagement letter and fee structure', date: new Date(Date.now() - 86400000 * 1).toISOString(), loggedBy: 'Adv. Kumar' }
                        ].map(s => (
                          <div key={s.id} className="p-4 flex gap-4 opacity-70 italic">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              {commIcons[s.type as keyof typeof commIcons] || <MessageSquarePlus className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{s.summary} <Badge variant="outline" className="text-[8px] h-3 ml-1 px-1 font-normal opacity-50">SAMPLE</Badge></p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(s.date, { month: 'short', day: 'numeric' } as any)} · by {s.loggedBy}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SUB-CLIENTS TAB */}
              <TabsContent value="sub-clients" className="space-y-4 mt-0">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="py-4 border-b bg-muted/20 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Sub-Clients
                    </CardTitle>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => setAddSubClientOpen(true)}>
                      <UserPlus className="h-3 w-3" /> Add Sub-Client
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loadingSubClients ? (
                      <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : subClients.length > 0 ? (
                      <div className="divide-y">
                        {subClients.map((sc: any) => (
                          <div key={sc.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/clients/${sc.id}`)}>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                {sc.avatar}
                              </div>
                              <div>
                                <p className="text-sm font-semibold group-hover:text-primary transition-colors">{sc.name}</p>
                                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                  {sc.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {sc.email}</span>}
                                  {sc.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {sc.phone}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] bg-background">{sc.type}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${sc.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-muted'}`}>{sc.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center">
                        <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No sub-clients yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Add sub-clients like family members, co-directors, or representatives.</p>
                        <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setAddSubClientOpen(true)}>
                          <UserPlus className="h-3 w-3" /> Add First Sub-Client
                        </Button>
                      </div>
                    )}
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
                                {formatDate(comm.date, { month: 'short', day: 'numeric' })}
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
                                  <Calendar className="h-3 w-3" /> F/U: {formatDate(comm.followUpDate, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )) : (
                        /* Sample Timeline Data when empty */
                        [
                          { id: 's1', type: 'Call', summary: 'Initial Reach-out', notes: 'Client inquired about legal services for a property dispute in Mumbai.', date: new Date(Date.now() - 86400000 * 5).toISOString(), loggedBy: 'System' },
                          { id: 's2', type: 'Meeting', summary: 'Strategy Session', notes: 'Discussed potential litigation routes and fee arrangements.', date: new Date(Date.now() - 86400000 * 3).toISOString(), loggedBy: 'Adv. Kumar' }
                        ].map((s, i) => (
                          <div key={s.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active opacity-60">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm">
                              {commIcons[s.type as keyof typeof commIcons]}
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border shadow-sm rounded-xl p-4">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s.type}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {formatDate(s.date, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold">{s.summary}</h4>
                              <p className="text-xs text-muted-foreground mt-2 bg-muted/20 p-2 rounded-md italic">
                                {s.notes}
                              </p>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t text-[10px]">
                                <span className="text-muted-foreground">Logged by <span className="font-medium text-foreground">{s.loggedBy}</span></span>
                                <Badge variant="outline" className="text-[8px] h-3 px-1 font-normal">SAMPLE</Badge>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {totalCommPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => setCommPage(p => Math.max(1, p - 1))}
                                className={commPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {Array.from({ length: Math.min(totalCommPages, 5) }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink 
                                  onClick={() => setCommPage(i + 1)}
                                  isActive={commPage === i + 1}
                                  className="cursor-pointer"
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => setCommPage(p => Math.min(totalCommPages, p + 1))}
                                className={commPage === totalCommPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DOCUMENTS TAB */}
              <TabsContent value="documents" className="mt-0">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Client Documents</CardTitle>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => setIsUploadModalOpen(true)}>
                      <Upload className="h-3 w-3" /> Add Document
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {clientDocs.map(doc => (
                        <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-muted/30 group">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{doc.fileName}</p>
                              <p className="text-xs text-muted-foreground">{doc.documentType} · Added {formatDate(doc.uploadedAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => window.open((doc as any).file_url || (doc as any).fileUrl, '_blank')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => {
                              if(confirm('Are you sure you want to delete this document?')) {
                                deleteDocMutation.mutate(doc.id);
                              }
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Badge variant="secondary" className="font-mono text-[10px] hidden sm:inline-flex">{doc.caseId.split('-')[0]}</Badge>
                          </div>
                        </div>
                      ))}
                      {clientDocs.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">No documents shared with this client.</div>
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
                      <p className="text-3xl font-display font-bold mt-2">
                        {formatCurrency(billingTotals.total)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={`border-border/60 shadow-sm bg-gradient-to-br ${billingTotals.outstanding > 0 ? 'from-amber-50 to-orange-50/20 border-amber-200' : 'from-green-50 to-emerald-50/20 border-green-200'}`}>
                    <CardContent className="p-6">
                      <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${billingTotals.outstanding > 0 ? 'text-amber-800' : 'text-green-800'}`}>
                        <Activity className="h-3.5 w-3.5" /> Outstanding Amount
                      </p>
                      <p className={`text-3xl font-display font-bold mt-2 ${billingTotals.outstanding > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                        {formatCurrency(billingTotals.outstanding)}
                      </p>
                      {billingTotals.outstanding === 0 && (
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
          defaultCaseId={(client as any).cases[0]?.id}
        />
        <UploadDocumentModal 
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          clientId={client.id}
          caseId={linkedCases[0]?.id}
        />
        <AddSubClientModal 
          parentClientId={client.id}
          parentClientName={client.name}
          isOpen={addSubClientOpen}
          onClose={() => setAddSubClientOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
