import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ReportFilters as IReportFilters } from "@/types/report";
import { useQuery } from "@tanstack/react-query";
import { clientService } from "@/services/clientService";
import { caseService } from "@/services/caseService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReportFiltersProps {
  filters: IReportFilters;
  onChange: (filters: IReportFilters) => void;
}

export function ReportFilters({ filters, onChange }: ReportFiltersProps) {
  const { data: clientsResponse } = useQuery<{ data: any[], totalCount: number }>({ 
    queryKey: ['clients'], 
    queryFn: () => clientService.getAllClients(1, 1000) 
  });
  const clients = clientsResponse?.data || [];
  const { data: casesResponse } = useQuery<{ data: any[], totalCount: number }>({
    queryKey: ['cases'], 
    queryFn: () => caseService.getAllCases(1, 1000) 
  });
  const cases = casesResponse?.data || [];

  const selectedClientIds = Array.isArray(filters.clientId) ? filters.clientId : filters.clientId ? [filters.clientId] : [];
  const selectedCaseIds = Array.isArray(filters.caseId) ? filters.caseId : filters.caseId ? [filters.caseId] : [];

  const filteredCases = cases.filter(c => 
    selectedClientIds.length === 0 || selectedClientIds.includes(c.clientId!)
  );

  const toggleItem = (current: string[], id: string) => {
    return current.includes(id) 
      ? current.filter(i => i !== id) 
      : [...current, id];
  };

  return (
    <Card className="border-none shadow-sm bg-muted/30">
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Date From</Label>
          <Input 
            type="date" 
            value={filters.dateRange?.from || ''} 
            onChange={(e) => onChange({ ...filters, dateRange: { ...filters.dateRange, from: e.target.value, to: filters.dateRange?.to || '' } })}
            className="h-9 bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Date To</Label>
          <Input 
            type="date" 
            value={filters.dateRange?.to || ''} 
            onChange={(e) => onChange({ ...filters, dateRange: { from: filters.dateRange?.from || '', to: e.target.value } })}
            className="h-9 bg-background"
          />
        </div>
        {/* Clients Multi-Select */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Clients</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-full justify-between bg-background font-normal px-3 rounded-lg overflow-hidden">
                <span className="truncate">
                  {selectedClientIds.length === 0 ? "All Clients" : `${selectedClientIds.length} Selected`}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2 rounded-xl" align="start">
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <div className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded cursor-pointer" onClick={() => onChange({ ...filters, clientId: [] })}>
                  <Checkbox checked={selectedClientIds.length === 0} />
                  <span className="text-xs">All Clients</span>
                </div>
                {clients.map(c => (
                  <div key={c.id} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    onChange({ ...filters, clientId: toggleItem(selectedClientIds, c.id) });
                  }}>
                    <Checkbox checked={selectedClientIds.includes(c.id)} />
                    <span className="text-xs truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Cases Multi-Select (Filtered by Client) */}
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Cases</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-full justify-between bg-background font-normal px-3 rounded-lg overflow-hidden border-border/60">
                <span className="truncate">
                  {selectedCaseIds.length === 0 ? "All Cases" : `${selectedCaseIds.length} Selected`}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-2 rounded-xl" align="start">
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <div className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded cursor-pointer" onClick={() => onChange({ ...filters, caseId: [] })}>
                  <Checkbox checked={selectedCaseIds.length === 0} />
                  <span className="text-xs font-bold">All Cases</span>
                </div>
                {filteredCases.map(c => (
                  <div key={c.id} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    onChange({ ...filters, caseId: toggleItem(selectedCaseIds, c.id) });
                  }}>
                    <Checkbox checked={selectedCaseIds.includes(c.id)} />
                    <div className="min-w-0">
                      <p className="text-xs truncate font-medium">{c.title}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{c.caseNumber}</p>
                    </div>
                  </div>
                ))}
                {filteredCases.length === 0 && (
                  <p className="text-[10px] text-center py-4 text-muted-foreground italic">No cases found for selected clients.</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
