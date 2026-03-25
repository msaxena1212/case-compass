import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ReportFilters as IReportFilters } from "@/types/report";
import { useQuery } from "@tanstack/react-query";
import { clientService } from "@/services/clientService";
import { caseService } from "@/services/caseService";

interface ReportFiltersProps {
  filters: IReportFilters;
  onChange: (filters: IReportFilters) => void;
}

export function ReportFilters({ filters, onChange }: ReportFiltersProps) {
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientService.getAllClients });
  const { data: cases = [] } = useQuery({ queryKey: ['cases'], queryFn: caseService.getAllCases });

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
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Client</Label>
          <Select value={filters.clientId || 'all'} onValueChange={(val) => onChange({ ...filters, clientId: val === 'all' ? undefined : val })}>
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Case</Label>
          <Select value={filters.caseId || 'all'} onValueChange={(val) => onChange({ ...filters, caseId: val === 'all' ? undefined : val })}>
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder="All Cases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cases</SelectItem>
              {cases.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
