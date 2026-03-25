import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/reportService";
import { Loader2, TrendingUp, Users, Briefcase, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

export default function Analytics() {
  const { data: performance, isLoading: loadingPerf } = useQuery({
    queryKey: ['firm-performance'],
    queryFn: reportService.getFirmPerformance
  });

  const { data: cases = [], isLoading: loadingCases } = useQuery({
    queryKey: ['cases-stats'],
    queryFn: reportService.getCaseStats
  });

  const { data: revenueTrend = [], isLoading: loadingTrend } = useQuery({
    queryKey: ['revenue-trend'],
    queryFn: reportService.getRevenueTrend
  });

  const isLoading = loadingPerf || loadingCases || loadingTrend;

  // Process data for charts
  const caseTypeData = cases.reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.name === curr.type);
    if (existing) existing.value++;
    else acc.push({ name: curr.type, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#0F172A', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Computing Business Intelligence...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Firm Intelligence Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time data on case velocity, financial health, and growth metrics.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Firm Revenue', value: `₹${((performance?.totalRevenue || 0) / 100000).toFixed(1)}L`, icon: DollarSign, trend: '+14%', up: true },
            { label: 'Active Clients', value: performance?.totalClients, icon: Users, trend: '+5', up: true },
            { label: 'Global Cases', value: performance?.totalCases, icon: Briefcase, trend: '-2%', up: false },
            { label: 'Avg Case Value', value: `₹${((performance?.averageCaseValue || 0) / 1000).toFixed(0)}K`, icon: TrendingUp, trend: '+8%', up: true },
          ].map(s => (
            <Card key={s.label} className="border-border/60 shadow-sm relative overflow-hidden group">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                   <div className="h-8 w-8 rounded-lg bg-accent/5 flex items-center justify-center text-accent">
                     <s.icon className="h-4 w-4" />
                   </div>
                   <div className={`flex items-center gap-0.5 text-[10px] font-bold ${s.up ? 'text-emerald-600' : 'text-red-600'}`}>
                     {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                     {s.trend}
                   </div>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-display font-bold mt-0.5">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Distribution */}
          <Card className="lg:col-span-2 border-border/60 shadow-sm">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-bold">Billing Velocity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[320px]">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenueTrend.length > 0 ? revenueTrend : [
                   { name: 'Jan', revenue: 0 },
                   { name: 'Feb', revenue: 0 },
                   { name: 'Mar', revenue: 0 },
                   { name: 'Apr', revenue: performance?.totalRevenue || 0 },
                 ]}>
                   <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                   <XAxis dataKey="name" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} />
                   <YAxis fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/100000}L`} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                     formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Revenue']}
                   />
                   <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                 </AreaChart>
               </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Practice Area Mix */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-bold">Practice Area Mix</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={caseTypeData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {caseTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {caseTypeData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                       <span className="font-bold">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground font-medium">{item.value} cases</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
