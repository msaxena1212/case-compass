import { Integration } from "@/types/integration";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RefreshCcw, ExternalLink, Settings2, Power } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (id: string, status: boolean) => void;
}

export function IntegrationCard({ integration, onToggle }: IntegrationCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success(`${integration.provider} sync completed.`);
    }, 2000);
  };

  const isConnected = integration.status === 'Connected' || integration.status === 'Syncing';

  return (
    <Card className={`overflow-hidden border-border/60 hover:shadow-md transition-all ${!isConnected ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <CardContent className="p-0">
        <div className="p-4 flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center text-2xl shrink-0 shadow-sm border border-border/40">
            {integration.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold truncate">{integration.provider}</h3>
              <Badge className={`text-[9px] font-black uppercase tracking-widest px-1.5 h-4 border ${
                integration.status === 'Connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                integration.status === 'Error' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {integration.status}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {integration.description}
            </p>
            {isConnected && integration.lastSync && (
              <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <RefreshCcw className="h-2.5 w-2.5" />
                Last synced: {new Date(integration.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        <div className="bg-muted/30 border-t p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Switch 
              checked={isConnected} 
              onCheckedChange={(val) => onToggle(integration.id, val)}
              className="data-[state=checked]:bg-accent scale-75"
            />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {isConnected ? 'Active' : 'Offline'}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-accent" onClick={handleSync} disabled={isSyncing}>
                  <RefreshCcw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-accent">
                  <Settings2 className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] font-bold bg-white text-accent border-accent/20 hover:bg-accent/5">
                Connect <ExternalLink className="h-3 w-3 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
