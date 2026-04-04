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
        <Card className="border-none shadow-xl bg-gradient-to-br from-accent/10 via-background to-primary/5 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent opacity-70" />
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-inner">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold tracking-tight text-foreground">Strategic Intelligence</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/80">AI-Powered Trend Analysis</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
              {aiInsights.split('\n').map((line, i) => {
                if (line.startsWith('###')) {
                  return <h3 key={i} className="text-sm font-bold text-foreground mt-4 mb-2 flex items-center gap-2">
                    {line.includes('Verdict') && <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
                    {line.replace('###', '').trim()}
                  </h3>
                }
                if (line.startsWith('-')) {
                  return <div key={i} className="flex gap-3 text-sm text-muted-foreground mb-1 ml-2">
                    <span className="text-accent mt-1">•</span>
                    <span>{line.replace('-', '').trim()}</span>
                  </div>
                }
                if (line.trim()) {
                  return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
                }
                return null;
              })}
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
