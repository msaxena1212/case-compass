import { useState } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Scale, 
  MessageCircle,
  Mail,
  Smartphone,
  ExternalLink
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockNotifications, getUnreadNotificationCount, markNotificationAsRead } from "@/store/mockData";
import { AppNotification, NotificationChannel, NotificationType } from "@/types/communication";
import { useNavigate } from "react-router-dom";

export function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(getUnreadNotificationCount());

  const recentNotifications = mockNotifications
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'Hearing': return <Scale className="h-3.5 w-3.5 text-indigo-500" />;
      case 'Task': return <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />;
      case 'Billing': return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
      case 'Communication': return <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />;
      default: return <Bell className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  const handleRead = (id: string, url?: string) => {
    markNotificationAsRead(id);
    setUnreadCount(getUnreadNotificationCount());
    setIsOpen(false);
    if (url) navigate(url);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-muted/40 hover:bg-muted/80 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground border-2 border-white text-[10px] font-black">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-2xl border-border/80" align="end">
        <div className="p-4 flex items-center justify-between bg-muted/30">
          <h3 className="text-sm font-bold tracking-tight">Recent Alerts</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-0.5 bg-white border rounded shadow-sm">
            {unreadCount} New
          </span>
        </div>
        <Separator />
        
        <div className="max-h-[350px] overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <p className="text-xs text-muted-foreground italic">No notifications yet.</p>
            </div>
          ) : (
            recentNotifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 border-b last:border-0 cursor-pointer hover:bg-accent/5 transition-colors group relative ${n.status === 'Unread' ? 'bg-accent-[3%]' : 'opacity-80'}`}
                onClick={() => handleRead(n.id, n.actionUrl)}
              >
                {n.status === 'Unread' && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(251,107,15,0.6)]" />
                )}
                <div className="flex gap-3 ml-2">
                  <div className="mt-0.5 p-1.5 bg-muted rounded border border-border/40 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-tight mb-0.5 ${n.status === 'Unread' ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 group-hover:line-clamp-none transition-all">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className="text-[9px] text-muted-foreground opacity-60 font-medium">
                         {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <Separator />
        <Button 
          variant="ghost" 
          className="w-full rounded-none h-11 text-xs font-bold text-accent hover:bg-accent/5 hover:text-accent gap-2"
          onClick={() => { navigate('/notifications'); setIsOpen(false); }}
        >
          View All Notifications <ExternalLink className="h-3 w-3" />
        </Button>
      </PopoverContent>
    </Popover>
  );
}
