import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { officeService } from "@/services/officeService";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, Users, PieChart, MapPin, Phone,
  TrendingUp, Plus, ChevronRight, Globe, TrendingDown,
  Mail, Briefcase, GraduationCap, ArrowRightLeft, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function FirmManagement() {
  const [activeTab, setActiveTab] = useState("offices");
  const [officePage, setOfficePage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  const pageSize = 10;

  const { data: allOffices = [] } = useQuery({
    queryKey: ['all-offices'],
    queryFn: () => officeService.getAllOffices()
  });

  const { data: officesResponse, isLoading: loadingOffices } = useQuery({
    queryKey: ['offices', officePage],
    queryFn: () => officeService.getRevenueMetrics(officePage, pageSize)
  });
  const offices = officesResponse?.data || [];
  const totalOffices = officesResponse?.totalCount || 0;
  const totalOfficePages = Math.ceil(totalOffices / pageSize);

  const { data: staffResponse, isLoading: loadingStaff } = useQuery({
    queryKey: ['firm-staff', staffPage],
    queryFn: () => officeService.getFirmStaff(staffPage, pageSize)
  });
  const firmStaff = staffResponse?.data || [];
  const totalStaffCount = staffResponse?.totalCount || 0;
  const totalStaffPages = Math.ceil(totalStaffCount / pageSize);

  const isLoading = loadingOffices || loadingStaff;

  const totalRevenue = allOffices.reduce((sum: number, off: any) => sum + (off.monthly_revenue || 0), 0);
  const firmWideStaffTotal = allOffices.reduce((sum: number, off: any) => sum + (off.staff_count || 0), 0);
  const firmWideCasesTotal = allOffices.reduce((sum: number, off: any) => sum + (off.active_cases_count || 0), 0);

  const getOfficeName = (id: string) => offices.find((o: any) => o.id === id)?.name || id;

  // Pie chart data for revenue share
  const revenueData = offices.map((off: any) => ({
    name: off.name || 'Unknown',
    value: off.monthlyRevenue || 0,
    color: String(off.id).includes('delhi') ? '#0F172A' : String(off.id).includes('mumbai') ? '#3B82F6' : '#8B5CF6'
  }));

  const revenueMetrics = offices.map((off: any) => ({
    officeId: off.id,
    revenue: off.monthlyRevenue,
    target: (off.monthlyRevenue || 0) * 1.2,
    month: 'Mar'
  }));

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Gathering Intelligence...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Law Firm Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Multi-office operations, cross-branch teams, and revenue intelligence.</p>
          </div>
          <Button onClick={() => toast.info('Feature coming soon', { description: 'Office expansion capabilities will be enabled next month.' })} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            <Plus className="h-4 w-4" /> Add New Office
          </Button>
        </div>

        {/* Global Firm Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Branches', value: allOffices.length, sub: 'Delhi, Mumbai, BLR', icon: Globe },
            { label: 'Firm-wide Team', value: firmWideStaffTotal, sub: 'Across all offices', icon: Users },
            { label: 'Active Cases', value: firmWideCasesTotal, sub: 'Global workload', icon: Briefcase },
            { label: 'Monthly Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, sub: '+12% vs last month', icon: TrendingUp },
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

        <Tabs defaultValue="offices" onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-12 gap-6 p-0">
            <TabsTrigger value="offices" className="rounded-none h-full bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-1 text-xs font-bold gap-2">
              <Building2 className="h-4 w-4" /> Office Branches
            </TabsTrigger>
            <TabsTrigger value="team" className="rounded-none h-full bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-1 text-xs font-bold gap-2">
              <Users className="h-4 w-4" /> Global Team
            </TabsTrigger>
            <TabsTrigger value="performance" className="rounded-none h-full bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-1 text-xs font-bold gap-2">
              <PieChart className="h-4 w-4" /> Revenue Intelligence
            </TabsTrigger>
          </TabsList>

          {/* Offices Tab */}
          <TabsContent value="offices" className="pt-6 m-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offices.map((office: any) => (
                <Card key={office.id} className="group hover:shadow-md transition-all border-border/60 overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b p-4">
                    <div className="flex justify-between items-start">
                      <div className="h-10 w-10 rounded-xl bg-white border border-border/50 flex items-center justify-center text-xl shadow-sm">
                        {office.location === 'Delhi' ? '🏛️' : office.location === 'Mumbai' ? '🌆' : '🚀'}
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase">
                        {office.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold mt-3">{office.name}</CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" /> {office.address}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Team Size</p>
                        <p className="text-sm font-bold">{office.staffCount} Staff</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Revenue</p>
                        <p className="text-sm font-bold text-accent">₹{(office.monthlyRevenue / 100000).toFixed(1)}L</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{office.phone}</span>
                      </div>
                      <Button onClick={() => toast.info('Branch Details', { description: `Loading detailed view for ${office.name}...` })} variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold hover:bg-accent/10 hover:text-accent gap-1">
                        View Branch <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalOfficePages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setOfficePage(p => Math.max(1, p - 1))}
                        className={officePage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalOfficePages, 5) }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setOfficePage(i + 1)}
                          isActive={officePage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setOfficePage(p => Math.min(totalOfficePages, p + 1))}
                        className={officePage === totalOfficePages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Cross-Office Resource Sharing</p>
                  <p className="text-xs text-muted-foreground">Move associates between branches to handle temporary case load spikes.</p>
                </div>
              </div>
              <Button onClick={() => toast.info('Transfer System', { description: 'Resource orchestration engine is currently offline for maintenance.' })} size="sm" className="bg-white border text-accent hover:bg-accent/5 font-bold">Initiate Transfer</Button>
            </div>
          </TabsContent>

          {/* Global Team Tab */}
          <TabsContent value="team" className="pt-6 m-0">
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Professional</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Role</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Office</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Department</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {firmStaff.map((u: any) => (
                    <TableRow key={u.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent text-xs">
                            {u.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[9px] font-black uppercase h-5 ${
                          u.role === 'Partner' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                          u.role === 'Senior Lawyer' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-muted'
                        }`}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{getOfficeName(u.officeId)}</TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">{u.department}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold">
                          <div className={`h-1.5 w-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          {u.status}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalStaffPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setStaffPage(p => Math.max(1, p - 1))}
                        className={staffPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalStaffPages, 5) }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setStaffPage(i + 1)}
                          isActive={staffPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setStaffPage(p => Math.min(totalStaffPages, p + 1))}
                        className={staffPage === totalStaffPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="performance" className="pt-6 m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">Revenue by Office</CardTitle>
                    <p className="text-[11px] text-muted-foreground">Monthly billing performance across branches.</p>
                  </div>
                  <Select defaultValue="3m">
                    <Badge variant="outline" className="text-[10px] font-bold">Last 3 Months</Badge>
                  </Select>
                </CardHeader>
                <CardContent className="p-6 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueMetrics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="officeId" 
                        fontSize={10} 
                        fontWeight={700}
                        tickFormatter={getOfficeName}
                      />
                      <YAxis fontSize={10} fontWeight={700} tickFormatter={(v) => `₹${v/100000}L`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(v: any) => [`₹${(v / 100000).toFixed(1)}L`, 'Revenue']}
                        labelFormatter={getOfficeName}
                      />
                      <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                        {revenueMetrics.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={revenueData[index % revenueData.length]?.color || '#8B5CF6'} />
                        ))}
                      </Bar>
                      <Bar dataKey="target" fill="#E2E8F0" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold">Contribution Share</CardTitle>
                  <p className="text-[11px] text-muted-foreground">Firm revenue split by location.</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6 pt-4">
                    {revenueData.map(item => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold">{item.name}</span>
                          <span className="font-black" style={{ color: item.color }}>{((item.value / totalRevenue) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(item.value / totalRevenue) * 100}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-3 rounded-xl bg-muted/20 border border-dashed text-[11px] text-muted-foreground text-center">
                    "Partner dividend eligibility calculated at 15% of branch net profit."
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function Select({ children, defaultValue }: any) {
  return <div className="text-xs font-bold">{children}</div>;
}
