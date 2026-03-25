import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { IntegrationCard } from "@/components/IntegrationCard";
import { ApiKeyManager } from "@/components/ApiKeyManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockIntegrations, mockApiSyncLogs } from "@/store/mockData";
import { Integration } from "@/types/integration";
import {
  Plug, Globe, Puzzle, Zap, Activity, Key, 
  ExternalLink, CheckCircle2, AlertCircle, RefreshCcw, 
  Terminal, Code2, BookOpen
} from "lucide-react";
import { toast } from "sonner";

export default function IntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);

  const handleToggleIntegration = (id: string, active: boolean) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, status: active ? 'Connected' : 'Disconnected' } : int
    ));
    toast.success(`${integrations.find(i => i.id === id)?.provider} ${active ? 'connected' : 'disconnected'}.`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Integration Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect Case Compass to your favorite legal and business tools.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 font-bold bg-white">
              <BookOpen className="h-4 w-4" /> API Docs
            </Button>
            <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <Zap className="h-4 w-4" /> Create Webhook
            </Button>
          </div>
        </div>

        {/* Connectivity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Connectors', value: integrations.filter(i => i.status === 'Connected').length, sub: 'Out of 5 available', icon: Plug },
            { label: 'Total API Keys', value: '3', sub: '2 active, 1 revoked', icon: Key },
            { label: 'Sync Success Rate', value: '98.5%', sub: 'Last 7 days', icon: Activity },
            { label: 'Daily API Calls', value: '1.2k', sub: 'No rate limits hit', icon: Zap },
          ].map(s => (
            <Card key={s.label} className="border-border/60 shadow-sm">
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.sub}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent">
                  <s.icon className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="directory" className="w-full">
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <TabsList className="w-full rounded-none border-b bg-muted/20 p-0 h-11">
              <TabsTrigger value="directory" className="flex-1 rounded-none h-11 text-xs font-bold data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent gap-2">
                <Puzzle className="h-3.5 w-3.5" /> App Directory
              </TabsTrigger>
              <TabsTrigger value="api" className="flex-1 rounded-none h-11 text-xs font-bold data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent gap-2">
                <Code2 className="h-3.5 w-3.5" /> Developer Portal
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 rounded-none h-11 text-xs font-bold data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent gap-2">
                <Activity className="h-3.5 w-3.5" /> Sync History
              </TabsTrigger>
            </TabsList>

            {/* App Directory Tab */}
            <TabsContent value="directory" className="p-6 m-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map(integration => (
                  <IntegrationCard 
                    key={integration.id} 
                    integration={integration} 
                    onToggle={handleToggleIntegration}
                  />
                ))}
              </div>
              
              <div className="p-4 bg-muted/10 border border-dashed rounded-xl flex items-center justify-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">
                  Missing an app? <Button variant="link" className="p-0 h-auto text-accent text-xs font-bold">Request a custom integration</Button>
                </p>
              </div>
            </TabsContent>

            {/* Developer Portal Tab */}
            <TabsContent value="api" className="p-6 m-0 gap-6 grid grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <ApiKeyManager />
              </div>
              
              <div className="space-y-4">
                <Card className="border-border/60 shadow-none bg-muted/10">
                  <CardHeader className="p-4 border-b">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-accent" /> API Endpoint
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <code className="text-[10px] break-all font-mono text-muted-foreground bg-white p-2 rounded border block">
                      https://api.casecompass.com/v1
                    </code>
                    <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                      Use this base URL for all your API requests. Authentication is required via the X-API-KEY header.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 shadow-none bg-muted/10">
                  <CardHeader className="p-4 border-b">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Puzzle className="h-3.5 w-3.5 text-accent" /> Webhooks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                      "Receive real-time notifications for Case Updates, Hearing Deadlines, and Invoice Payments."
                    </p>
                    <Button variant="outline" size="sm" className="w-full mt-3 h-8 text-[10px] font-bold bg-white border-accent/20 text-accent hover:bg-accent/5">
                      Configure Webhooks
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sync History Tab */}
            <TabsContent value="history" className="p-0 m-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="w-[180px] font-bold text-[10px] uppercase tracking-wider pl-6">Timestamp</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">App / Integration</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Event</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Details</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockApiSyncLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="text-[11px] font-medium text-muted-foreground pl-6">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="font-bold text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{mockIntegrations.find(i => i.provider === log.provider)?.icon}</span>
                          {log.provider}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{log.event}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground italic">"{log.details}"</TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge className={`text-[9px] font-black uppercase h-5 px-1.5 ${
                          log.status === 'Success' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'
                        } border`}>
                          {log.status === 'Success' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t flex justify-center">
                <Button variant="ghost" size="sm" className="text-[10px] font-bold text-muted-foreground hover:bg-muted/10 gap-2">
                  <RefreshCcw className="h-3 w-3" /> Load more history
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
