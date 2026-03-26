import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { ReportType } from "@/types/report";

import { useState, useEffect } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface ReportPreviewProps {
  type: ReportType;
  data: any[];
  isLoading: boolean;
  aiInsights?: string;
}

export function ReportPreview({ type, data, isLoading, aiInsights }: ReportPreviewProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Reset page when data changes (e.g. new report type or filters)
  useEffect(() => {
    setPage(1);
  }, [type, data]);

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl border-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium text-muted-foreground">Aggregating legal data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl border-muted">
        <FileText className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
        <p className="text-sm font-medium text-muted-foreground">No data matches your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {aiInsights && (
        <Card className="border-accent/20 bg-accent/5 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
          <CardContent className="p-4 flex gap-3">
            <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1 flex items-center gap-2">
                AI Strategic Insight
                <Badge variant="outline" className="text-[8px] h-4 border-accent text-accent">Ollama GLM-5</Badge>
              </p>
              <p className="text-sm leading-relaxed text-foreground/80 italic">{aiInsights}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-md overflow-hidden bg-background">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Live Preview: {type}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(data[0] || {}).map((key) => (
                    <TableHead key={key} className="text-[10px] uppercase font-bold tracking-wider py-3">
                      {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, idx) => (
                  <TableRow key={idx}>
                    {Object.values(row).map((val: any, i) => (
                      <TableCell key={i} className="text-sm py-3 font-medium">
                        {typeof val === 'number' ? (val > 1000 ? `₹${val.toLocaleString()}` : val) : String(val)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <div className="p-4 border-t bg-muted/20 flex justify-center">
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
      </Card>
    </div>
  );
}
