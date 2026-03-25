import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourtCaseLink, SyncLog } from "@/types/court";
import { mockCourtOrders, mockSyncLogs, simulateCourtSync } from "@/store/mockData";
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Scale,
  Link2,
  History
} from "lucide-react";
import { toast } from "sonner";

interface CourtSyncPanelProps {
  caseId: string;
  courtLink: CourtCaseLink | undefined;
  onLinkClick: () => void;
}

export function CourtSyncPanel({ caseId, courtLink, onLinkClick }: CourtSyncPanelProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastLog, setLastLog] = useState<SyncLog | undefined>(
    mockSyncLogs.find(l => l.caseId === caseId)
  );

  const orders = mockCourtOrders.filter(o => o.caseId === caseId);

  const handleSync = async () => {
    if (!courtLink) return;
    setIsSyncing(true);
    toast.info(`Syncing with eCourts... CNR: ${courtLink.cnrNumber}`);
    
    const log = await simulateCourtSync(caseId, courtLink.cnrNumber);
    setLastLog(log);
    setIsSyncing(false);

    if (log.status === 'Success') {
      toast.success(`Sync complete! ${log.updatesFound} update(s) found.`);
    } else {
      toast.error('Sync failed. eCourts server timed out. Will retry automatically.');
    }
  };

  if (!courtLink) {
    return (
      <div className="p-6 rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 text-center space-y-3">
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
          <Scale className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-bold">Not linked to eCourts</p>
          <p className="text-xs text-muted-foreground mt-1">Link this case to get automatic hearing updates, orders, and cause list tracking.</p>
        </div>
        <Button size="sm" onClick={onLinkClick} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold">
          <Link2 className="h-4 w-4" /> Link to eCourts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className={`border ${courtLink.syncStatus === 'Success' ? 'border-emerald-200 bg-emerald-50/30' : courtLink.syncStatus === 'Failed' ? 'border-red-200 bg-red-50/30' : 'border-border/50'}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{courtLink.courtType}</p>
              <p className="text-sm font-bold truncate">{courtLink.courtName}</p>
              <p className="font-mono text-xs text-accent font-bold bg-accent/10 px-2 py-0.5 rounded w-fit">{courtLink.cnrNumber}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 gap-1.5 text-xs font-bold"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${
                courtLink.syncStatus === 'Success' ? 'text-emerald-600' : 
                courtLink.syncStatus === 'Failed' ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {courtLink.syncStatus === 'Success' && <CheckCircle2 className="h-3 w-3" />}
                {courtLink.syncStatus === 'Failed' && <XCircle className="h-3 w-3" />}
                {courtLink.syncStatus === 'Pending' && <Clock className="h-3 w-3" />}
                {courtLink.syncStatus}
              </div>
            </div>
          </div>

          {courtLink.lastSyncedAt && (
            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <History className="h-3 w-3" />
              Last synced: {new Date(courtLink.lastSyncedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Orders from eCourts */}
      {orders.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Court Orders & Updates</p>
          {orders.map(order => (
            <div key={order.id} className="p-3 border rounded-lg bg-white hover:bg-muted/20 transition-colors group flex flex-col gap-1.5">
              <div className="flex justify-between items-start">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                  order.type === 'Hearing Scheduled' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  order.type === 'Adjournment' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  order.type === 'Notice Issued' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                  'bg-muted border-border text-muted-foreground'
                }`}>
                  {order.type}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {new Date(order.orderDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-foreground leading-relaxed">{order.description}</p>
              {order.nextHearingDate && (
                <p className="text-[10px] font-bold text-accent">
                  📅 Next: {new Date(order.nextHearingDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              {order.sourceUrl && (
                <a href={order.sourceUrl} target="_blank" rel="noopener noreferrer" 
                   className="text-[10px] text-muted-foreground hover:text-accent transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                   onClick={e => e.stopPropagation()}>
                  <ExternalLink className="h-3 w-3" /> View on eCourts Portal
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Last sync result */}
      {lastLog && (
        <div className={`p-3 rounded-lg border text-xs font-medium flex items-start gap-2 ${
          lastLog.status === 'Success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {lastLog.status === 'Success' ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" /> : <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
          {lastLog.message}
        </div>
      )}
    </div>
  );
}
