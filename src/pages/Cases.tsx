import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Briefcase, Activity, Loader2, ArrowRightLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { caseService } from "@/services/caseService";
import { clientService } from "@/services/clientService";
import { calculateHealthScore } from "@/utils/caseUtils";
import { formatDate } from "@/utils/formatters";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { TransferCaseModal } from "@/components/TransferCaseModal";

const typeFilters = ["All", "Civil", "Criminal", "Corporate", "Family"];

export default function Cases() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [transferCase, setTransferCase] = useState<any | null>(null);
  const pageSize = 10;
  const navigate = useNavigate();

  const { data: caseResponse, isLoading: loadingCases } = useQuery({
    queryKey: ['cases', page],
    queryFn: () => caseService.getAllCases(page, pageSize)
  });

  const rawCases = caseResponse?.data || [];
  const totalCount = caseResponse?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const { data: clientsResponse, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAllClients(1, 1000)
  });

  const clients = clientsResponse?.data || [];
  const isLoading = loadingCases || loadingClients;

  const casesData = useMemo(() => rawCases.map(c => {
    const client = clients.find(cli => cli.id === c.clientId);
    return {
      ...c,
      clientName: client?.name || "Unknown",
      healthScore: calculateHealthScore(c)
    };
  }), [rawCases, clients]);

  const filtered = useMemo(() => casesData.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchType = activeFilter === "All" || c.type === activeFilter;
    return matchSearch && matchType;
  }), [casesData, search, activeFilter]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading Cases...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {transferCase && (
        <TransferCaseModal
          isOpen={!!transferCase}
          onClose={() => setTransferCase(null)}
          caseId={transferCase.id}
          caseTitle={transferCase.title}
          currentOfficeId={transferCase.officeId}
          currentLawyerId={transferCase.lawyerId}
        />
      )}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Cases</h1>
            <p className="text-sm text-muted-foreground mt-1">{casesData.length} total cases · {casesData.filter(c => c.status !== "Lost" && c.status !== "Won" && c.status !== "Settled" && c.status !== "Withdrawn").length} active</p>
          </div>
          <Button 
            onClick={() => navigate("/cases/new")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" /> New Case
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by case title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {typeFilters.map((f) => (
              <Button
                key={f}
                variant={activeFilter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(f)}
                className={activeFilter === f ? "bg-primary text-primary-foreground" : ""}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Cases List */}
        <Card>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">Case Title</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Office</div>
              <div className="col-span-1">Health</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Actions</div>
            </div>

            <div className="divide-y">
              {filtered.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => navigate(`/cases/${c.id}`)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer items-center"
                >
                  <div className="col-span-1 text-xs font-mono text-muted-foreground">{c.id.split("_")[1] || c.id}</div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    {c.caseNumber && <p className="text-xs text-muted-foreground">{c.caseNumber}</p>}
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-muted-foreground">{c.type}</span>
                  </div>
                  <div className="col-span-2 text-sm truncate">{c.clientName}</div>
                  <div className="col-span-2 text-xs text-muted-foreground truncate">{c.officeName}</div>
                  <div className="col-span-1 flex items-center gap-1 text-xs">
                    <Activity className={`h-3 w-3 ${c.healthScore > 80 ? 'text-green-500' : c.healthScore > 50 ? 'text-yellow-500' : 'text-red-500'}`} />
                    <span>{c.healthScore}%</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setTransferCase(c);
                      }}
                      className="h-8 w-8 p-0 hover:bg-accent/10"
                      title="Transfer Case"
                    >
                      <ArrowRightLeft className="h-4 w-4 text-accent" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Briefcase className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No cases found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {!search && totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
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
      </div>
    </AppLayout>
  );
}
