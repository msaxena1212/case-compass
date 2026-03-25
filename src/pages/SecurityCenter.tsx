import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AuditLogTable } from "@/components/AuditLogTable";
import { SecurityAlertsCard } from "@/components/SecurityAlertsCard";
import { AccessControlMatrix } from "@/components/AccessControlMatrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck, Lock, Activity, Users, ShieldAlert,
  Fingerprint, Database, Download, RefreshCcw, Eye
} from "lucide-react";
import { toast } from "sonner";

export default function SecurityCenter() {
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  const handleRunBackup = () => {
    setIsBackupRunning(true);
    setTimeout(() => {
      setIsBackupRunning(false);
      toast.success("Database backup completed and encrypted successfully.");
    }, 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Security & Compliance Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor system integrity, audit firm activity, and manage data protection.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 font-bold" onClick={handleRunBackup} disabled={isBackupRunning}>
              {isBackupRunning ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              {isBackupRunning ? "Backing up..." : "Manual Backup"}
            </Button>
            <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <Download className="h-4 w-4" /> Export Audit Log
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Security Score', value: '94/100', color: 'text-emerald-600', sub: 'Excellent Standing' },
            { label: 'Active Sessions', value: '18', color: 'text-foreground', sub: 'Across 3 offices' },
            { label: 'Login Success', value: '99.2%', color: 'text-foreground', sub: 'Last 24 hours' },
            { label: 'Encrypted Files', value: '2,482', color: 'text-accent', sub: 'AES-256 Storage' },
          ].map(s => (
            <Card key={s.label} className="border-border/60 shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-display font-bold mt-1 ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="audit" className="w-full">
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <TabsList className="w-full rounded-none border-b bg-muted/20 p-0 h-11">
                  <TabsTrigger value="audit" className="flex-1 rounded-none h-11 text-xs font-bold data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent gap-2">
                    <Activity className="h-3.5 w-3.5" /> Audit Center
                  </TabsTrigger>
                  <TabsTrigger value="access" className="flex-1 rounded-none h-11 text-xs font-bold data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent gap-2">
                    <Users className="h-3.5 w-3.5" /> Access Management
                  </TabsTrigger>
                  <TabsTrigger value="policy" className="flex-1 rounded-none h-11 text-xs font-bold data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" /> Data Policies
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="audit" className="p-6 m-0">
                  <AuditLogTable />
                </TabsContent>

                <TabsContent value="access" className="p-6 m-0">
                  <AccessControlMatrix />
                </TabsContent>

                <TabsContent value="policy" className="p-6 m-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Lock className="h-4 w-4 text-accent" /> Firm-wide Security Policies
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Enforce firm-wide standards for all employees across all offices.</p>
                    </div>

                    <div className="grid gap-4">
                      {[
                        { id: '2fa', label: '2FA Enforcement', desc: 'Require Multi-Factor Authentication for all lawyer logins.', defaultChecked: true },
                        { id: 'ip', label: 'IP Whitelisting', desc: 'Restrict access to known office IP addresses only.', defaultChecked: false },
                        { id: 'timeout', label: 'Auto-Session Timeout', desc: 'Automatically logout users after 15 minutes of inactivity.', defaultChecked: true },
                        { id: 'logs', label: 'Immutable Audit Logs', desc: 'Prevent deletion of system logs for compliance purposes.', defaultChecked: true },
                      ].map((policy) => (
                        <div key={policy.id} className="flex items-center justify-between p-4 border rounded-xl bg-muted/10 group hover:border-accent/40 transition-all">
                          <div className="space-y-0.5">
                            <Label htmlFor={policy.id} className="text-xs font-bold cursor-pointer">{policy.label}</Label>
                            <p className="text-[11px] text-muted-foreground">{policy.desc}</p>
                          </div>
                          <Switch id={policy.id} defaultChecked={policy.defaultChecked} className="data-[state=checked]:bg-accent" />
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border border-dashed rounded-xl bg-blue-50/50 flex items-center gap-3">
                      <Fingerprint className="h-8 w-8 text-blue-600/40" />
                      <div>
                        <p className="text-xs font-bold text-blue-700">Digital Signature Policy</p>
                        <p className="text-[11px] text-blue-600/80 leading-relaxed">
                          All contracts generated in the CLM module are automatically stamped with a cryptographic hash for authenticity verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Sidebar Area: Security Alerts */}
          <div className="space-y-6">
            <SecurityAlertsCard />
            
            <Card className="border-accent/20 bg-accent/5 overflow-hidden shadow-sm">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                  <Eye className="h-3 w-3" /> Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold">GDPR Readiness</span>
                    <span className="text-emerald-600 font-black">92%</span>
                  </div>
                  <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[92%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold">ISO 27001 Alignment</span>
                    <span className="text-blue-600 font-black">88%</span>
                  </div>
                  <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[88%]" />
                  </div>
                </div>
                <div className="pt-2 border-t border-accent/10">
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    "Data retention policy: 7 years as per Indian Bar Council standards."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
