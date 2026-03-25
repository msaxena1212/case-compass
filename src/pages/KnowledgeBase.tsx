import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AILegalAssistant } from "@/components/AILegalAssistant";
import { KnowledgeSidebar } from "@/components/KnowledgeSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { KnowledgeItem, KnowledgeType } from "@/types/knowledge";
import { knowledgeBaseService } from "@/services/knowledgeBaseService";
import { useQuery } from "@tanstack/react-query";
import { Scale, FileText, BookOpen, Clock, Eye, Loader2 } from "lucide-react";

const FILTERS: { label: string; value: KnowledgeType | "All" }[] = [
  { label: "All Databank", value: "All" },
  { label: "Judgments", value: "Judgment" },
  { label: "Templates", value: "Template" },
  { label: "Acts & Sections", value: "Act" }
];

export default function KnowledgeBase() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<KnowledgeType | "All">("All");
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12; // 3 per row looks better with 12

  const { data: response, isLoading } = useQuery({
    queryKey: ['knowledge-base', query, activeFilter, page],
    queryFn: () => knowledgeBaseService.searchKnowledge(query, activeFilter, page, pageSize),
    placeholderData: (previousData) => previousData
  });

  const filteredResults = response?.data || [];
  const totalCount = response?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // AI assistant calls this
  const handleSearch = (q: string) => {
    setQuery(q);
  };

  const getTypeIcon = (type: KnowledgeType) => {
    if (type === 'Judgment') return <Scale className="h-4 w-4 text-indigo-500" />;
    if (type === 'Template') return <FileText className="h-4 w-4 text-emerald-500" />;
    return <BookOpen className="h-4 w-4 text-amber-500" />;
  };

  if (isLoading && filteredResults.length === 0) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Scanning Databank...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Legal Knowledge Databank</h1>
          <p className="text-sm text-muted-foreground mt-1 text-balance">
            Instantly search past firm cases, landmark judgments, and standard templates using natural language.
          </p>
        </div>

        {/* AI Search Assistant */}
        <AILegalAssistant onSearch={handleSearch} />

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {FILTERS.map(f => (
            <Button
              key={f.value}
              variant={activeFilter === f.value ? "default" : "outline"}
              className={`rounded-full h-8 text-xs font-semibold shrink-0 transition-all ${
                activeFilter === f.value ? "bg-accent hover:bg-accent/90 shadow-sm" : "bg-white hover:bg-muted/50 text-muted-foreground border-border/60"
              }`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
          {query && (
            <Button variant="ghost" size="sm" onClick={() => setQuery("")} className="h-8 text-xs shrink-0 text-muted-foreground ml-auto hover:text-foreground">
              Clear Search
            </Button>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredResults.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No matches found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Try asking a different question or adjusting your filters to explore the databank.
              </p>
            </div>
          ) : (
            filteredResults.map(item => (
              <Card 
                key={item.id} 
                className="group cursor-pointer hover:shadow-md transition-all duration-300 border-border/60 hover:border-accent/40 bg-white"
                onClick={() => setSelectedItem(item)}
              >
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-muted/50 rounded-md border border-border/40 group-hover:bg-white transition-colors">
                         {getTypeIcon(item.type)}
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                         {item.type}
                       </span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {item.snippet}
                  </p>

                  <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-border/40">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 h-[22px] overflow-hidden">
                      {item.tags.slice(0, 3).map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-muted text-[10px] font-medium text-muted-foreground rounded whitespace-nowrap">
                          {t}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-muted text-[10px] font-medium text-muted-foreground rounded">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    {/* Meta */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(item.dateAdded).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {item.views} views</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
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

      <KnowledgeSidebar 
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </AppLayout>
  );
}
