import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Mail, MessageSquare, Calendar, Cloud, 
  Check, X, ExternalLink, Loader2, 
  Plug, Shield, Bell
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'Email' | 'Messaging' | 'Cloud' | 'Calendar';
  features: string[];
}

const integrations: Integration[] = [
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Sync Gmail, Google Drive, and Calendar with LegalDesk.',
    icon: <Mail className="h-6 w-6" />,
    color: 'text-red-500 bg-red-50',
    category: 'Email',
    features: ['Gmail Sync', 'Drive Storage', 'Calendar Events']
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Connect Outlook email and OneDrive for seamless office integration.',
    icon: <Mail className="h-6 w-6" />,
    color: 'text-blue-600 bg-blue-50',
    category: 'Email',
    features: ['Outlook Mail', 'OneDrive', 'Teams Meetings']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive real-time case updates and alerts in your Slack channels.',
    icon: <MessageSquare className="h-6 w-6" />,
    color: 'text-purple-600 bg-purple-50',
    category: 'Messaging',
    features: ['Channel Notifications', 'Case Alerts', 'Hearing Reminders']
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Send case updates and reminders to clients via WhatsApp.',
    icon: <MessageSquare className="h-6 w-6" />,
    color: 'text-green-600 bg-green-50',
    category: 'Messaging',
    features: ['Client Notifications', 'Hearing Alerts', 'Invoice Reminders']
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Sync and backup case documents to Dropbox automatically.',
    icon: <Cloud className="h-6 w-6" />,
    color: 'text-blue-500 bg-blue-50',
    category: 'Cloud',
    features: ['Auto-backup', 'Shared Folders', 'Version Sync']
  },
  {
    id: 'zoom',
    name: 'Zoom Meetings',
    description: 'Schedule virtual hearings and client consultations via Zoom.',
    icon: <Calendar className="h-6 w-6" />,
    color: 'text-blue-700 bg-blue-50',
    category: 'Calendar',
    features: ['Hearing Links', 'Recording', 'Client Meetings']
  },
];

export default function Integrations() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    if (connected[id]) {
      setConnected(prev => ({ ...prev, [id]: false }));
      toast.success(`Disconnected from ${integrations.find(i => i.id === id)?.name}`);
      return;
    }
    setConnecting(id);
    // Simulate OAuth flow
    await new Promise(r => setTimeout(r, 1500));
    setConnected(prev => ({ ...prev, [id]: true }));
    setConnecting(null);
    toast.success(`Connected to ${integrations.find(i => i.id === id)?.name}!`);
  };

  const connectedCount = Object.values(connected).filter(Boolean).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Integrations</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect LegalDesk with your favorite tools and services.</p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1.5 gap-2 shrink-0">
            <Plug className="h-4 w-4" /> {connectedCount} Connected
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Available', value: integrations.length, icon: Plug, color: 'text-blue-600 bg-blue-50' },
            { label: 'Connected', value: connectedCount, icon: Check, color: 'text-green-600 bg-green-50' },
            { label: 'Alerts Active', value: connectedCount * 2, icon: Bell, color: 'text-amber-600 bg-amber-50' },
          ].map(stat => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</p>
                  <p className="text-xl font-display font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {integrations.map(integration => {
            const isConnected = connected[integration.id];
            const isConnecting = connecting === integration.id;
            return (
              <Card key={integration.id} className={`hover:shadow-md transition-all ${isConnected ? 'border-green-200 bg-green-50/30' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${integration.color}`}>
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{integration.name}</h3>
                        <Badge variant="secondary" className="text-[9px] mt-0.5">{integration.category}</Badge>
                      </div>
                    </div>
                    {isConnected && <Shield className="h-4 w-4 text-green-600" />}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{integration.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {integration.features.map(f => (
                      <span key={f} className="text-[9px] bg-muted px-1.5 py-0.5 rounded font-medium">{f}</span>
                    ))}
                  </div>

                  <Button 
                    variant={isConnected ? "outline" : "default"}
                    className={`w-full gap-2 ${isConnected ? 'border-green-200 text-green-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200' : ''}`}
                    onClick={() => handleToggle(integration.id)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</>
                    ) : isConnected ? (
                      <><Check className="h-4 w-4" /> Connected</>
                    ) : (
                      <><ExternalLink className="h-4 w-4" /> Connect</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
