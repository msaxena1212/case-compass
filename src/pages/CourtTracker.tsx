import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { LinkCourtModal } from "@/components/LinkCourtModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courtTrackerService } from "@/services/courtTrackerService";
import { caseService } from "@/services/caseService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CourtCaseLink } from "@/types/court";
import { 
  Scale, RefreshCw, CheckCircle2, XCircle, Clock, Link2,
  ExternalLink, History, AlertTriangle, Building, Gavel, List
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function CourtTracker() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [linkModal, setLinkModal] = useState<{ open: boolean; caseId: string; title: string }>({
    open: false, caseId: '', title: ''
  });

  const [linkedPage, setLinkedPage] = useState(1);
  const [syncPage, setSyncPage] = useState(1);
  const [causePage, setCausePage] = useState(1);
  const pageSize = 10;

  const { data: casesResponse, isLoading: loadingCases } = useQuery({ 
    queryKey: ['cases'], 
    queryFn: () => caseService.getAllCases(1, 1000) 
  });
  const cases = casesResponse?.data || [];

  const { data: linkedResponse, isLoading: loadingLinks } = useQuery({ 
    queryKey: ['court-links', linkedPage], 
    queryFn: () => courtTrackerService.getLinkedCases(linkedPage, pageSize) 
  });
  const linkedCases = linkedResponse?.data || [];
  const totalLinked = linkedResponse?.totalCount || 0;
  const totalLinkedPages = Math.ceil(totalLinked / pageSize);

  const { data: syncResponse, isLoading: loadingLogs } = useQuery({ 
    queryKey: ['court-sync-logs', syncPage], 
    queryFn: () => courtTrackerService.getSyncLogs(syncPage, pageSize) 
  });
  const syncLogs = syncResponse?.data || [];
  const totalSyncLogs = syncResponse?.totalCount || 0;
  const totalSyncPages = Math.ceil(totalSyncLogs / pageSize);

  const { data: causeResponse, isLoading: loadingCause } = useQuery({ 
    queryKey: ['cause-list', causePage], 
    queryFn: () => courtTrackerService.getCauseList(causePage, pageSize) 
  });
  const causeList = causeResponse?.data || [];
  const totalCause = causeResponse?.totalCount || 0;
  const totalCausePages = Math.ceil(totalCause / pageSize);

  const isLoading = loadingCases || loadingLinks || loadingLogs || loadingCause;

  const unlinkedCases = cases.filter(c => !linkedCases.find((l: any) => l.case_id === c.id));

  const syncAll = async () => {
    const ids = new Set(linkedCases.map((l: any) => l.id));
    setSyncingIds(ids);
    toast.info(`Syncing all ${linkedCases.length} linked cases...`);

    await Promise.all(
      linkedCases.map((l: any) => courtTrackerService.simulateSync(l.case_id, l.cnr_number))
    );

    setSyncingIds(new Set());
    queryClient.invalidateQueries({ queryKey: ['court-links', 'court-sync-logs'] });
    toast.success('All linked cases synced successfully.');
  };

  const syncOne = async (link: any) => {
    setSyncingIds(prev => new Set([...prev, link.id]));
    const log = await courtTrackerService.simulateSync(link.case_id, link.cnr_number);
    setSyncingIds(prev => { const s = new Set(prev); s.delete(link.id); return s; });
    queryClient.invalidateQueries({ queryKey: ['court-links', 'court-sync-logs'] });

    if (log.status === 'Success') {
      toast.success(`Synced ${link.cnr_number}: ${log.updates_found || 0} update(s).`);
    } else {
      toast.error(`Sync failed for ${link.cnr_number}. Will retry.`);
    }
  };

  const successRate = syncLogs.length > 0
    ? Math.round((syncLogs.filter(l => l.status === 'Success').length / syncLogs.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing Tracker...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight flex items-center gap-2">
              <Scale className="h-6 w-6 text-accent" /> eCourts Integration Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Automatically sync case statuses, orders, and cause lists from the national eCourts portal.
            </p>
          </div>
          <Button
            onClick={syncAll}
            disabled={syncingIds.size > 0}
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${syncingIds.size > 0 ? 'animate-spin' : ''}`} />
            {syncingIds.size > 0 ? 'Syncing All...' : 'Sync All Cases'}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Linked Cases', value: linkedCases.length, icon: Link2, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Sync Success Rate', value: `${successRate}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending Sync', value: linkedCases.filter((l: any) => l.sync_status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: "Today's Cause List", value: causeList.length, icon: List, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map(s => (
            <Card key={s.label} className="border-border/60 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className={`text-2xl font-display font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Court-Linked Cases */}
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Linked Cases</h2>

            {linkedCases.length === 0 ? (
              <div className="py-16 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center text-muted-foreground">
                <Scale className="h-10 w-10 opacity-20 mb-3" />
                <p className="text-sm font-semibold">No cases linked yet</p>
              </div>
            ) : (
              linkedCases.map((link: any) => {
                const caseData = link.case_data || link.caseData;
                const isSyncing = syncingIds.has(link.id);
                return (
                  <Card key={link.id} className="border-border/60 shadow-sm hover:shadow-md transition-all group">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p 
                            className="text-sm font-bold truncate hover:text-accent cursor-pointer transition-colors"
                            onClick={() => navigate(`/cases/${caseData?.id}`)}
                          >
                            {caseData?.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-indigo-50 border-indigo-200 text-indigo-700 h-5">
                              {link.court_type || link.courtType}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium truncate">{link.court_name || link.courtName}</span>
                          </div>
                          <p className="font-mono text-[11px] text-accent font-bold mt-1.5 bg-accent/5 px-2 py-0.5 rounded w-fit border border-accent/20">
                            {link.cnr_number || link.cnrNumber}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs font-bold"
                            onClick={() => syncOne(link)}
                            disabled={isSyncing}
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing' : 'Sync'}
                          </Button>
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${
                            (link.sync_status || link.syncStatus) === 'Success' ? 'text-emerald-600' :
                            (link.sync_status || link.syncStatus) === 'Failed' ? 'text-red-600' : 'text-amber-600'
                          }`}>
                            {(link.sync_status || link.syncStatus) === 'Success' && <CheckCircle2 className="h-3 w-3" />}
                            {(link.sync_status || link.syncStatus) === 'Failed' && <XCircle className="h-3 w-3" />}
                            {((link.sync_status || link.syncStatus) === 'Pending' || (link.sync_status || link.syncStatus) === 'In Progress') && <Clock className="h-3 w-3" />}
                            {link.sync_status || link.syncStatus}
                          </div>
                        </div>
                      </div>
                      {(link.last_synced_at || link.lastSyncedAt) && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <History className="h-3 w-3" />
                          Last synced: {new Date(link.last_synced_at || link.lastSyncedAt).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}

            {totalLinkedPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setLinkedPage(p => Math.max(1, p - 1))}
                        className={linkedPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalLinkedPages, 5) }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setLinkedPage(i + 1)}
                          isActive={linkedPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setLinkedPage(p => Math.min(totalLinkedPages, p + 1))}
                        className={linkedPage === totalLinkedPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Unlinked Cases */}
            {unlinkedCases.length > 0 && (
              <div className="space-y-3 pt-2">
                <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Not Yet Linked ({unlinkedCases.length})</h2>
                {unlinkedCases.map(c => (
                  <div key={c.id} className="p-4 border border-dashed border-border/60 rounded-xl flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">{c.title}</p>
                      <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-wider mt-0.5">{c.type}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs font-bold h-8 border-accent/40 text-accent hover:bg-accent/5"
                      onClick={() => setLinkModal({ open: true, caseId: c.id, title: c.title })}
                    >
                      <Link2 className="h-3.5 w-3.5" /> Link
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column: Cause List + Sync History */}
          <div className="space-y-6">
            {/* Today's Cause List */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-accent" /> Today's Cause List
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y">
                {causeList.map((entry: any, i: number) => (
                  <div key={i} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                        Sr. {entry.serialNumber}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">{entry.scheduledTime}</span>
                    </div>
                    <p className="text-xs font-bold leading-snug">{entry.caseTitle}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{entry.courtRoom} · {entry.stage}</p>
                  </div>
                ))}
              </CardContent>
              {totalCausePages > 1 && (
                <div className="p-3 border-t bg-muted/20 flex justify-center scale-90">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCausePage(p => Math.max(1, p - 1))}
                          className={causePage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-[10px] font-bold px-2">Page {causePage} of {totalCausePages}</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCausePage(p => Math.min(totalCausePages, p + 1))}
                          className={causePage === totalCausePages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </Card>

            {/* Sync History */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" /> Sync History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y max-h-72 overflow-y-auto">
                {syncLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="px-4 py-3 flex items-start gap-2.5">
                    {log.status === 'Success'
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      : <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-bold text-muted-foreground">{log.cnrNumber}</p>
                      <p className="text-[10px] text-foreground leading-snug mt-0.5">{log.message}</p>
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                        {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              {totalSyncPages > 1 && (
                <div className="p-3 border-t bg-muted/20 flex justify-center scale-90">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setSyncPage(p => Math.max(1, p - 1))}
                          className={syncPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-[10px] font-bold px-2">Page {syncPage} of {totalSyncPages}</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setSyncPage(p => Math.min(totalSyncPages, p + 1))}
                          className={syncPage === totalSyncPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <LinkCourtModal
        open={linkModal.open}
        onOpenChange={(o) => setLinkModal(prev => ({ ...prev, open: o }))}
        caseId={linkModal.caseId}
        caseTitle={linkModal.title}
        onLinked={() => queryClient.invalidateQueries({ queryKey: ['court-links'] })}
      />
    </AppLayout>
  );
}
