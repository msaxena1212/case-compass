import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  MessageCircle, 
  Mail, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Smartphone,
  Filter,
  MoreVertical,
  Scale,
  FileText
} from "lucide-react";
import { communicationService } from "@/services/communicationService";
import { AppNotification, NotificationChannel, NotificationType } from "@/types/communication";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IndianRupee, UserPlus, Sparkles } from "lucide-react";

export default function NotificationsHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotificationType | 'All'>('All');
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | 'All'>('All');

  const [notificationPage, setNotificationPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const pageSize = 10;

  const { data: notificationResponse, isLoading: loadingNotifications } = useQuery({
    queryKey: ['notifications', notificationPage],
    queryFn: () => communicationService.getNotifications(notificationPage, pageSize)
  });

  const { data: logResponse, isLoading: loadingLogs } = useQuery({
    queryKey: ['communication-logs', logPage],
    queryFn: () => communicationService.getCommunicationLogs(logPage, pageSize)
  });

  // Mutation and generateSample removed as requested


  const notifications = notificationResponse?.data || [];
  const totalNotifications = notificationResponse?.totalCount || 0;
  const totalNotificationPages = Math.ceil(totalNotifications / pageSize);

  const communicationLogs = logResponse?.data || [];
  const totalLogs = logResponse?.totalCount || 0;
  const totalLogPages = Math.ceil(totalLogs / pageSize);

  const isLoading = loadingNotifications || loadingLogs;

  const filteredNotifications = notifications.filter(n => {
    const typeMatch = filter === 'All' || n.type === filter;
    const channelMatch = channelFilter === 'All' || n.channel === channelFilter;
    return typeMatch && channelMatch;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'Hearing': return <Scale className="h-4 w-4 text-indigo-500" />;
      case 'Task': return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'Billing': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'Communication': return <MessageCircle className="h-4 w-4 text-emerald-500" />;
      default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'WhatsApp': return <MessageCircle className="h-3 w-3 text-emerald-600" />;
      case 'Email': return <Mail className="h-3 w-3 text-blue-600" />;
      case 'SMS': return <Smartphone className="h-3 w-3 text-slate-600" />;
      default: return <Bell className="h-3 w-3 text-slate-400" />;
    }
  };

  const handleExportText = () => {
    const activeTab = document.querySelector('[data-state="active"]')?.getAttribute('value') || 'notifications';
    let text = `Case Compass - ${activeTab === 'notifications' ? 'Notifications' : 'Communication Logs'} Export\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `--------------------------------------------------\n\n`;

    if (activeTab === 'notifications') {
      filteredNotifications.forEach(n => {
        text += `[${new Date(n.timestamp).toLocaleString()}] ${n.title}\n`;
        text += `Type: ${n.type} | Channel: ${n.channel} | Status: ${n.status}\n`;
        text += `Message: ${n.message}\n`;
        text += `--------------------------------------------------\n`;
      });
    } else {
      communicationLogs.forEach(log => {
        text += `[${new Date(log.timestamp).toLocaleString()}] To: ${log.receiver}\n`;
        text += `Type: ${log.type} | Channel: ${log.channel} | Status: ${log.status}\n`;
        text += `Summary: ${log.summary}\n`;
        text += `Notes: ${log.notes || 'N/A'}\n`;
        text += `--------------------------------------------------\n`;
      });
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case_compass_export_${activeTab}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Text report exported successfully!");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing Hub...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Notification & Communication Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Centralized view of all automated alerts and client communications.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-white font-bold h-10 border-border/60 hover:bg-muted/50" onClick={handleExportText}>
              <FileText className="h-4 w-4 text-accent" /> Export Text
            </Button>
            <Button variant="outline" className="gap-2 h-10 border-border/60">
              <Filter className="h-4 w-4" /> Export Logs
            </Button>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-lg border">
            <TabsTrigger value="notifications" className="px-6">Notifications</TabsTrigger>
            <TabsTrigger value="communications" className="px-6">Communication Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto scrollbar-none">
              {(['All', 'Hearing', 'Task', 'Billing', 'Communication'] as const).map(f => (
                <Button 
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full h-8 text-xs font-semibold shrink-0"
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredNotifications.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-muted/20 rounded-xl border border-dashed">
                  <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <h3 className="text-lg font-semibold">No notifications found</h3>
                  <p className="text-sm text-muted-foreground">Adjust your filters or wait for new events.</p>
                </div>
              ) : (
                filteredNotifications.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(n => (
                  <Card key={n.id} className={`group hover:shadow-md transition-all border-l-4 ${n.status === 'Unread' ? 'bg-accent/5 border-l-accent' : 'bg-white border-l-border/60 hover:border-l-accent/40'}`}>
                    <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                      <div className={`p-2 rounded-lg shrink-0 ${n.status === 'Unread' ? 'bg-accent/20 text-accent' : 'bg-muted/50 text-muted-foreground'}`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-sm font-semibold leading-none ${n.status === 'Unread' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded">
                            {new Date(n.timestamp).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-3 pt-2">
                           <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/40">
                             {getChannelIcon(n.channel)} {n.channel}
                           </div>
                           {n.status === 'Unread' && (
                             <Badge variant="secondary" className="bg-accent text-accent-foreground border-none h-4 px-1.5 text-[8px] font-black uppercase">Unread</Badge>
                           )}
                           {n.actionUrl && (
                             <Button 
                               variant="link" 
                               className="p-0 h-auto text-xs text-accent font-bold hover:no-underline"
                               onClick={() => navigate(n.actionUrl!)}
                             >
                               View Details →
                             </Button>
                           )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity p-0 h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {totalNotificationPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setNotificationPage(p => Math.max(1, p - 1))}
                        className={notificationPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalNotificationPages, 5) }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setNotificationPage(i + 1)}
                          isActive={notificationPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setNotificationPage(p => Math.min(totalNotificationPages, p + 1))}
                        className={notificationPage === totalNotificationPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            <div className="bg-white border rounded-xl overflow-hidden overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Content</th>
                    <th className="px-6 py-4">Channel</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {communicationLogs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-medium">
                        {new Date(log.timestamp).toLocaleDateString()} <span className="opacity-50 ml-1">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-accent">{log.receiver}</td>
                      <td className="px-6 py-4 max-w-xs "><p className="truncate text-muted-foreground">{(log as any).summary}</p></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase text-muted-foreground">
                          {getChannelIcon(log.channel)} {log.channel}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.status === 'Failed' ? (
                          <span className="flex items-center gap-1 text-red-600 font-bold text-[10px] uppercase">
                            <XCircle className="h-3 w-3" /> Delivery Failed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase">
                            <CheckCircle2 className="h-3 w-3" /> {log.status || 'Sent'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalLogPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setLogPage(p => Math.max(1, p - 1))}
                        className={logPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalLogPages, 5) }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setLogPage(i + 1)}
                          isActive={logPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setLogPage(p => Math.min(totalLogPages, p + 1))}
                        className={logPage === totalLogPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
