import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { securityService } from "@/services/securityService";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ShieldAlert, CheckCircle2, MoreHorizontal, Bell, Loader2 } from "lucide-react";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export function SecurityAlertsCard() {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { data: response, isLoading } = useQuery({
    queryKey: ['security-events', page],
    queryFn: () => securityService.getSecurityEvents(page, pageSize)
  });

  const securityEvents = response?.data || [];
  const totalCount = response?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between shrink-0">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent" /> Security Alerts
        </CardTitle>
        <Badge className="bg-red-100 text-red-700 border-red-200 h-5 px-2 text-[10px] font-black uppercase">
          {securityEvents.filter(e => !e.resolved).length} Unresolved
        </Badge>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto flex-1 bg-white min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
             <Loader2 className="h-8 w-8 text-accent animate-spin" />
             <p className="text-[10px] uppercase font-bold text-muted-foreground">Scrutinizing Threats...</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {securityEvents.map((event) => (
              <div key={event.id} className={`p-4 hover:bg-muted/20 transition-colors group flex items-start gap-3 ${event.resolved ? 'opacity-60' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  event.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                  event.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  <ShieldAlert className="h-4 w-4" />
                </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">{event.type}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] font-bold mb-1 leading-snug">{event.message}</p>
                {event.ipAddress && (
                  <p className="text-[10px] text-muted-foreground font-mono mb-2">Source IP: {event.ipAddress}</p>
                )}
                  {event.resolved ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      Resolved by {event.resolvedBy} at {new Date(event.resolvedAt!).toLocaleTimeString()}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 font-bold bg-white">Investigate</Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 font-bold">Ignore</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-3 border-t bg-muted/20 flex justify-center shrink-0">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50 h-7 w-7 p-0" : "cursor-pointer h-7 w-7 p-0"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-[10px] font-bold mx-2">Page {page} of {totalPages}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50 h-7 w-7 p-0" : "cursor-pointer h-7 w-7 p-0"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
