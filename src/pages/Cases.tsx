import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Briefcase } from "lucide-react";
import { useState } from "react";

const casesData = [
  { id: "C-2024-0847", title: "Sharma vs. State of Maharashtra", type: "Criminal", status: "Hearing", client: "Rajesh Sharma", court: "Mumbai High Court", filed: "Jan 15, 2024", nextDate: "Mar 20, 2026", lawyer: "Adv. Kumar" },
  { id: "C-2024-0846", title: "Patel Industries Ltd. Merger", type: "Corporate", status: "Active", client: "Patel Industries", court: "NCLT Mumbai", filed: "Feb 10, 2024", nextDate: "Mar 22, 2026", lawyer: "Adv. Mehta" },
  { id: "C-2024-0845", title: "Singh Property Dispute", type: "Civil", status: "Filed", client: "Harpreet Singh", court: "District Court Pune", filed: "Mar 1, 2024", nextDate: "Mar 25, 2026", lawyer: "Adv. Kumar" },
  { id: "C-2024-0844", title: "Gupta vs. Gupta Divorce", type: "Family", status: "Pending", client: "Anita Gupta", court: "Family Court Mumbai", filed: "Dec 20, 2023", nextDate: "Apr 5, 2026", lawyer: "Adv. Joshi" },
  { id: "C-2024-0843", title: "Tech Solutions IP Infringement", type: "Corporate", status: "Active", client: "Tech Solutions Pvt Ltd", court: "Delhi High Court", filed: "Nov 5, 2023", nextDate: "Mar 28, 2026", lawyer: "Adv. Kumar" },
  { id: "C-2024-0842", title: "Municipal Corp Land Acquisition", type: "Civil", status: "Hearing", client: "Residents Association", court: "High Court Bombay", filed: "Oct 12, 2023", nextDate: "Apr 1, 2026", lawyer: "Adv. Mehta" },
  { id: "C-2024-0841", title: "Desai Insurance Claim", type: "Civil", status: "Closed", client: "Vikram Desai", court: "Consumer Court", filed: "Aug 8, 2023", nextDate: "-", lawyer: "Adv. Joshi" },
  { id: "C-2024-0840", title: "Reddy Tax Evasion Defense", type: "Criminal", status: "Active", client: "Suresh Reddy", court: "Income Tax Tribunal", filed: "Sep 30, 2023", nextDate: "Apr 10, 2026", lawyer: "Adv. Kumar" },
];

const typeFilters = ["All", "Civil", "Criminal", "Corporate", "Family"];

export default function Cases() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = casesData.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchType = activeFilter === "All" || c.type === activeFilter;
    return matchSearch && matchType;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Cases</h1>
            <p className="text-sm text-muted-foreground mt-1">{casesData.length} total cases · {casesData.filter(c => c.status !== "Closed").length} active</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0">
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
              <div className="col-span-2">Court</div>
              <div className="col-span-1">Next Date</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Lawyer</div>
            </div>

            <div className="divide-y">
              {filtered.map((c) => (
                <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer items-center">
                  <div className="col-span-1 text-xs font-mono text-muted-foreground">{c.id}</div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium">{c.title}</p>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-muted-foreground">{c.type}</span>
                  </div>
                  <div className="col-span-2 text-sm">{c.client}</div>
                  <div className="col-span-2 text-xs text-muted-foreground">{c.court}</div>
                  <div className="col-span-1 text-xs">{c.nextDate}</div>
                  <div className="col-span-1">
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="col-span-1 text-xs text-muted-foreground">{c.lawyer}</div>
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
      </div>
    </AppLayout>
  );
}
