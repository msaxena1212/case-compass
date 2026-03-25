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
  const { data: casesData = [] } = useQuery({ queryKey: ['cases-report'], queryFn: caseService.getAllCases });
  const { data: billingData = [] } = useQuery({ queryKey: ['billing-report'], queryFn: billingService.getAllInvoices });
  const { data: auditData = [] } = useQuery({ queryKey: ['audit-report', filters], queryFn: () => reportService.getAuditLogs(filters) });

  const reportData = useMemo(() => {
    switch(selectedType) {
      case 'Case Summary':
        return casesData.map(c => ({
          ID: c.id.substring(0, 8),
          Title: c.title,
          Type: c.type,
          Status: c.status,
          Court: c.court,
          FilingDate: c.filingDate
        }));
      case 'Revenue':
        return billingData.map(i => ({
          Invoice: i.id,
          Total: i.total,
          Date: i.issuedDate,
          Status: i.status
        }));
      case 'Audit Log':
        return auditData.map(l => ({
          User: l.user_name,
          Action: l.action,
          Resource: l.resource,
          Status: l.status,
          Timestamp: new Date(l.timestamp).toLocaleString()
        }));
      default:
        return [];
    }
  }, [selectedType, casesData, billingData, auditData]);

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
            <p className="text-muted-foreground mt-1.5 flex items-center gap-2">
              <History className="h-4 w-4" /> Professional insights and compliance documentation for your firm.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 h-11 px-6 rounded-xl border-border/60 hover:bg-muted/50 transition-all">
              <Clock className="h-4 w-4" /> View History
            </Button>
            <Button className="gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all">
              <Plus className="h-4 w-4" /> Create Schedule
            </Button>
          </div>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl mb-6">
            <TabsTrigger value="generate" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Generate New</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Schedules</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6 mt-0">
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
          </TabsContent>

          <TabsContent value="history">
            <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-2xl border-border/60 bg-muted/10">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-bold">No Scheduled Reports</h3>
              <p className="text-sm text-muted-foreground mt-1">Automate your reporting workflow to save time.</p>
              <Button className="mt-6 gap-2 rounded-xl h-11 px-8 shadow-lg">
                <Plus className="h-4 w-4" /> Create Your First Schedule
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

