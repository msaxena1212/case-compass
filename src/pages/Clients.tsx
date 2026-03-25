import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, Phone, Mail, Briefcase, 
  MoreHorizontal, Users, Shield, ArrowUpRight,
  Activity, Tag, Loader2
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientService } from "@/services/clientService";
import { formatCurrency } from "@/utils/formatters";
import { AddClientModal } from "@/components/AddClientModal";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeType, setActiveType] = useState<string>('All');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['clients', page],
    queryFn: () => clientService.getAllClients(page, pageSize)
  });

  const clients = response?.data || [];
  const totalCount = response?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const filtered = useMemo(() => {
    let result = clients;
    if (activeType !== 'All') {
      result = result.filter(c => c.type === activeType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return result;
  }, [search, activeType, clients]);

  const stats = useMemo(() => ({
    total: clients.length,
    active: clients.filter(c => c.status === 'Active' || c.status === 'VIP').length,
    corporate: clients.filter(c => c.type === 'Corporate').length,
    outstanding: clients.reduce((sum, c) => sum + (c.outstandingAmount || 0), 0)
  }), [clients]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading Clients...</p>
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
            <h1 className="text-2xl font-display font-semibold tracking-tight">Client CRM</h1>
            <p className="text-sm text-muted-foreground mt-1">Know your clients better than your memory</p>
          </div>
          <Button onClick={() => setAddModalOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Onboard Client
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Clients', value: stats.total, icon: Users, color: 'text-blue-600 bg-blue-50' },
            { label: 'Active', value: stats.active, icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Corporate', value: stats.corporate, icon: Briefcase, color: 'text-purple-600 bg-purple-50' },
            { label: 'Outstanding Dues', value: formatCurrency(stats.outstanding), icon: ArrowUpRight, color: 'text-amber-600 bg-amber-50' },
          ].map(stat => (
            <Card key={stat.label} className="p-4 border-border/60 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-display font-bold leading-none mt-1">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, phone, or tags..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['All', 'Individual', 'Corporate', 'Association'].map(type => (
              <Button
                key={type}
                variant={activeType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveType(type)}
                className={`text-xs ${activeType === type ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(client => (
            <Card 
              key={client.id} 
              className="hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full border-border/60"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-display font-bold text-primary shrink-0">
                      {client.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{client.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{client.type}</span>
                        {client.status === 'VIP' && <span className="text-[8px] bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-1 py-0.5 rounded font-bold">VIP</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${getHealthColor(client.healthScore)}`} title="Client Health Score">
                    {client.healthScore}
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                  {client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {client.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                    <Briefcase className="h-3 w-3 text-primary" />
                    <span>{client.linkedCaseIds?.length || 0} Cases</span>
                  </div>
                  <div className="font-medium text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3" /> Since {new Date(client.createdAt).getFullYear()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No clients found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {!search && totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onClick={() => setPage(i + 1)}
                      isActive={page === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <AddClientModal 
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
