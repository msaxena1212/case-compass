import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockSecurityEvents } from "@/store/mockData";
import { AlertCircle, ShieldAlert, CheckCircle2, MoreHorizontal, Bell } from "lucide-react";

export function SecurityAlertsCard() {
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between shrink-0">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent" /> Security Alerts
        </CardTitle>
        <Badge className="bg-red-100 text-red-700 border-red-200 h-5 px-2 text-[10px] font-black uppercase">
          {mockSecurityEvents.filter(e => !e.resolved).length} Unresolved
        </Badge>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto flex-1">
        <div className="divide-y divide-border/50">
          {mockSecurityEvents.map((event) => (
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
      </CardContent>
    </Card>
  );
}
