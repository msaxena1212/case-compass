import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, FileText, Download, Share2, Calendar, 
  History, Clock, Plus, Filter, FileSpreadsheet,
  AlertCircle, Sparkles, Loader2
} from "lucide-react";
import { useState, useMemo } from "react";
import { ReportFilters } from "@/components/ReportFilters";
import { ReportPreview } from "@/components/ReportPreview";
import { ReportType, ReportFilters as IReportFilters } from "@/types/report";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/reportService";
import { caseService } from "@/services/caseService";
import { billingService } from "@/services/billingService";
import { clientService } from "@/services/clientService";
import { courtService } from "@/services/courtService";
import { toast } from "sonner";
import { generateLegalContent } from "@/lib/gemini";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";
import { Briefcase, DollarSign, ShieldCheck } from "lucide-react";

const reportTypes = [
  { id: 'Case Summary' as ReportType, title: 'Case Summary', desc: 'Detailed status and progress of legal cases.', icon: <Briefcase className="h-5 w-5" /> },
  { id: 'Revenue' as ReportType, title: 'Revenue Report', desc: 'Billing, income, and outstanding payment trends.', icon: <DollarSign className="h-5 w-5" /> },
  { id: 'Hearing History' as ReportType, title: 'Hearing History', desc: 'Complete log of past and upcoming court dates.', icon: <Calendar className="h-5 w-5" /> },
  { id: 'Audit Log' as ReportType, title: 'Compliance Audit', desc: 'Secure history of system actions and data changes.', icon: <ShieldCheck className="h-5 w-5" /> },
];


export default function Reports() {
  const [selectedType, setSelectedType] = useState<ReportType>('Case Summary');
  const [filters, setFilters] = useState<IReportFilters>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  // Queries for data aggregation based on type
  const { data: casesResponse } = useQuery({ queryKey: ['cases-report'], queryFn: () => caseService.getAllCases(1, 1000) });
  const casesData = casesResponse?.data || [];
  
  const { data: billingResponse } = useQuery({ queryKey: ['billing-report'], queryFn: () => billingService.getAllInvoices(1, 1000) });
  const billingData = billingResponse?.data || [];
  
  const { data: hearingsResponse } = useQuery({ queryKey: ['hearings-report'], queryFn: () => courtService.getAllHearings(1, 1000) });
  const hearingsData = hearingsResponse?.data || [];

  const { data: auditData = [] } = useQuery({ queryKey: ['audit-report', filters], queryFn: () => reportService.getAuditLogs(filters) });

  const reportData = useMemo(() => {
    const selectedClientIds = Array.isArray(filters.clientId) ? filters.clientId : filters.clientId ? [filters.clientId] : [];
    const selectedCaseIds = Array.isArray(filters.caseId) ? filters.caseId : filters.caseId ? [filters.caseId] : [];

    switch(selectedType) {
      case 'Case Summary':
        return casesData
          .filter(c => selectedClientIds.length === 0 || selectedClientIds.includes(c.clientId!))
          .filter(c => selectedCaseIds.length === 0 || selectedCaseIds.includes(c.id))
          .map(c => ({
            ID: c.id.substring(0, 8),
            Title: c.title,
            Type: c.type,
            Status: c.status,
            Court: c.court,
            FilingDate: c.filingDate
          }));
      case 'Revenue':
        return billingData
          .filter(i => selectedClientIds.length === 0 || selectedClientIds.includes(i.clientId!))
          .map(i => ({
            Invoice: i.id.substring(0, 8),
            Total: `₹${i.total.toLocaleString()}`,
            Date: i.issuedDate,
            Status: i.status
          }));
      case 'Audit Log':
        return auditData.map(l => ({
          User: l.user_name || 'System',
          Action: l.action,
          Resource: l.resource,
          Status: l.status,
          Timestamp: l.timestamp ? new Date(l.timestamp).toLocaleString() : 'N/A'
        }));
      case 'Hearing History':
        return hearingsData
          .filter(h => selectedCaseIds.length === 0 || selectedCaseIds.includes(h.caseId))
          .map(h => ({
            Date: h.date,
            Case: h.caseTitle || 'Generic Matter',
            Stage: h.stage,
            Court: h.court,
            Status: h.status
          })).sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
      default:
        return [];
    }
  }, [selectedType, casesData, billingData, auditData, hearingsData, filters]);

  const handleRunAI = async () => {
    if (reportData.length === 0) return;
    setIsGenerating(true);
    try {
      const prompt = `Analyze this legal ${selectedType} data and provide a concise 2-sentence strategic insight for the firm owner:\n${JSON.stringify(reportData.slice(0, 10))}`;
      const insight = await generateLegalContent(prompt);
      setAiInsight(insight);
      toast.success("AI Insights generated!");
    } catch (e) {
      toast.error("Failed to generate AI insights");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              Reporting & Analytics
            </h1>
            <p className="text-muted-foreground mt-1.5 flex items-center gap-2 text-sm leading-relaxed">
              Analyze firm performance, track hearing histories, and ensure regulatory compliance with automated data insights.
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-6">
            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {reportTypes.map(type => (
                <Card 
                  key={type.id} 
                  className={`cursor-pointer transition-all border-2 rounded-xl group hover:shadow-md ${selectedType === type.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border/40 hover:border-border'}`}
                  onClick={() => {
                    setSelectedType(type.id);
                    setAiInsight('');
                  }}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${selectedType === type.id ? 'bg-primary text-primary-foreground' : 'bg-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{type.title}</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-1">{type.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <ReportFilters filters={filters} onChange={setFilters} />

            {/* Actions Bar */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleRunAI} 
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-10 px-6 rounded-xl shadow-sm transition-all"
                disabled={isGenerating || reportData.length === 0}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Run AI Trend Analysis
              </Button>
              <div className="ml-auto flex gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2 h-10 border-border/60 rounded-xl hover:bg-muted/50"
                  onClick={() => exportToPDF(selectedType, reportData)}
                  disabled={reportData.length === 0}
                >
                  <FileText className="h-4 w-4 text-red-500" /> Export PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 h-10 border-border/60 rounded-xl hover:bg-muted/50"
                  onClick={() => exportToExcel(selectedType, reportData)}
                  disabled={reportData.length === 0}
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Excel
                </Button>
                <Button className="h-10 rounded-xl shadow-md border-b-2 border-primary-foreground/10">
                  Save Report
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <ReportPreview 
              type={selectedType} 
              data={reportData} 
              isLoading={false} 
              aiInsights={aiInsight}
            />
          </div>
        </div>
    </AppLayout>
  );
}

