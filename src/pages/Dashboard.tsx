import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Briefcase,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const stats = [
  { label: "Active Cases", value: "47", icon: Briefcase, change: "+3 this week" },
  { label: "Total Clients", value: "128", icon: Users, change: "+5 this month" },
  { label: "Upcoming Hearings", value: "12", icon: Calendar, change: "Next 7 days" },
  { label: "Revenue (MTD)", value: "₹4.2L", icon: DollarSign, change: "+18% vs last" },
];

const monthlyData = [
  { month: "Jul", cases: 8, revenue: 320 },
  { month: "Aug", cases: 12, revenue: 480 },
  { month: "Sep", cases: 6, revenue: 290 },
  { month: "Oct", cases: 15, revenue: 520 },
  { month: "Nov", cases: 10, revenue: 410 },
  { month: "Dec", cases: 14, revenue: 580 },
];

const caseTypes = [
  { name: "Civil", value: 35, color: "hsl(228, 35%, 16%)" },
  { name: "Criminal", value: 20, color: "hsl(42, 55%, 54%)" },
  { name: "Corporate", value: 25, color: "hsl(210, 70%, 50%)" },
  { name: "Family", value: 20, color: "hsl(152, 60%, 40%)" },
];

const recentCases = [
  { id: "C-2024-0847", title: "Sharma vs. State of Maharashtra", type: "Criminal", status: "Hearing", date: "Mar 20, 2026" },
  { id: "C-2024-0846", title: "Patel Industries Ltd. Merger", type: "Corporate", status: "Active", date: "Mar 18, 2026" },
  { id: "C-2024-0845", title: "Singh Property Dispute", type: "Civil", status: "Filed", date: "Mar 15, 2026" },
  { id: "C-2024-0844", title: "Gupta vs. Gupta Divorce", type: "Family", status: "Pending", date: "Mar 14, 2026" },
  { id: "C-2024-0843", title: "Tech Solutions IP Infringement", type: "Corporate", status: "Active", date: "Mar 12, 2026" },
];

const upcomingHearings = [
  { case: "Sharma vs. State", court: "Mumbai High Court", date: "Mar 20", time: "10:30 AM", judge: "Hon. Justice Desai" },
  { case: "Patel Industries", court: "NCLT Mumbai", date: "Mar 22", time: "2:00 PM", judge: "Hon. Member Rao" },
  { case: "Singh Property", court: "District Court", date: "Mar 25", time: "11:00 AM", judge: "Hon. Judge Verma" },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, Adv. Kumar. Here's your practice overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-success" />
                      {stat.change}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-body font-medium">Cases & Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 89%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 15%, 89%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="cases" fill="hsl(228, 35%, 16%)" radius={[4, 4, 0, 0]} name="Cases" />
                  <Bar dataKey="revenue" fill="hsl(42, 55%, 54%)" radius={[4, 4, 0, 0]} name="Revenue (K)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-body font-medium">Case Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={caseTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {caseTypes.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {caseTypes.map((t) => (
                  <div key={t.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Cases */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-body font-medium">Recent Cases</CardTitle>
              <a href="/cases" className="text-xs text-accent hover:underline flex items-center gap-0.5">
                View all <ArrowUpRight className="h-3 w-3" />
              </a>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentCases.map((c) => (
                  <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.id} · {c.type}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">{c.date}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Hearings */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-body font-medium">Upcoming Hearings</CardTitle>
              <a href="/calendar" className="text-xs text-accent hover:underline flex items-center gap-0.5">
                View calendar <ArrowUpRight className="h-3 w-3" />
              </a>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {upcomingHearings.map((h, i) => (
                  <div key={i} className="px-5 py-3 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                    <div className="text-center shrink-0 w-12">
                      <p className="text-lg font-display font-bold text-accent">{h.date.split(" ")[1]}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{h.date.split(" ")[0]}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{h.case}</p>
                      <p className="text-xs text-muted-foreground">{h.court}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{h.time}</span>
                        <span className="text-xs text-muted-foreground">· {h.judge}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-sm font-medium">3 deadlines approaching in the next 48 hours</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Filing deadline for C-2024-0847 · Response due for C-2024-0845 · Document submission for C-2024-0843
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
