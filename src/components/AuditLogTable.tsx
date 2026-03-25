import { useState } from "react";
import { AuditLog } from "@/types/security";
import { securityService } from "@/services/securityService";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Monitor, Shield, User, Clock } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export function AuditLogTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: response, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search],
    queryFn: () => securityService.getAuditLogs(page, pageSize, search)
  });

  const auditLogs = response?.data || [];
  const totalCount = response?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by user, action, or resource..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <Loader2 className="h-10 w-10 text-accent animate-spin" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing Audit Trail...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[180px] font-bold text-[10px] uppercase tracking-wider">Timestamp</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider">User</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Action</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Resource</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider">IP Address</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-xs whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] text-accent">
                        {(log.userName || 'U').charAt(0)}
                      </div>
                      {log.userName || 'System'}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">{log.action}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] font-black uppercase h-4 px-1 bg-muted/50">
                        {log.resourceType}
                      </Badge>
                      <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[120px]">
                        {log.resource}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      {log.ipAddress}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={`text-[9px] font-black uppercase h-4 px-1.5 ${
                      log.status === 'Success' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'
                    } border`}>
                      {log.status === 'Success' ? '✓ Success' : '✗ Failure'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {auditLogs.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">No logs found</TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
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
  );
}
