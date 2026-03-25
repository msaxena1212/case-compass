import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, FileText, File, FileImage, Filter,
  Download, Eye, Tag, Upload, FolderOpen,
  Sparkles, Brain, Shield, Database, BarChart3, 
  ChevronDown, Layers, Grid3X3, List, Loader2
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { documentService } from "@/services/documentService";
import { searchDocuments } from "@/store/mockData";
import { LegalDocument, DocumentType } from "@/types/document";
import { DocumentDetailPanel } from "@/components/DocumentDetailPanel";
import { UploadDocumentModal } from "@/components/UploadDocumentModal";

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-500" />,
  docx: <File className="h-5 w-5 text-blue-500" />,
  image: <FileImage className="h-5 w-5 text-green-500" />,
  xlsx: <File className="h-5 w-5 text-emerald-600" />,
};

const documentTypeFilters: (DocumentType | 'All')[] = ['All', 'Petition', 'Contract', 'Evidence', 'Order', 'Affidavit', 'Agreement'];

export default function Documents() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<DocumentType | 'All'>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [aiSearchMode, setAiSearchMode] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [groupByCase, setGroupByCase] = useState(false);

  const { data: documents = [], isLoading } = useQuery<LegalDocument[]>({
    queryKey: ['documents'],
    queryFn: documentService.getAllDocuments
  });

  const allTags = useMemo(() => Array.from(new Set(documents.flatMap(d => d.tags || []))), [documents]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filtered = useMemo(() => {
    let docs = [...documents];
    
    if (search.trim()) {
      const q = search.toLowerCase();
      docs = docs.filter(d => 
        (d.fileName?.toLowerCase() || "").includes(q) || 
        (d.caseName?.toLowerCase() || "").includes(q) ||
        (d.tags && d.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (activeType !== 'All') {
      docs = docs.filter(d => d.documentType === activeType);
    }
    if (selectedTags.length > 0) {
      docs = docs.filter(d => selectedTags.some(t => d.tags?.includes(t)));
    }

    return docs;
  }, [search, activeType, selectedTags, documents]);

  // Group by case
  const groupedDocs = useMemo(() => {
    if (!groupByCase) return null;
    const groups: Record<string, LegalDocument[]> = {};
    filtered.forEach(d => {
      if (!groups[d.caseName]) groups[d.caseName] = [];
      groups[d.caseName].push(d);
    });
    return groups;
  }, [filtered, groupByCase]);

  // Stats
  const stats = useMemo(() => ({
    total: documents.length,
    aiProcessed: documents.filter(d => d.aiSummary).length,
    riskFlags: documents.reduce((sum, d) => sum + (d.riskClauses?.length || 0), 0),
    totalSize: documents.reduce((sum, d) => {
      const sizeStr = d.size || "0 KB";
      const num = parseFloat(sizeStr);
      const unit = sizeStr.includes('MB') ? 1 : 0.001;
      return sum + num * unit;
    }, 0).toFixed(1),
  }), [documents]);

  const renderDocumentRow = (doc: LegalDocument) => (
    <div
      key={doc.id}
      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer items-center group"
      onClick={() => setSelectedDoc(doc)}
    >
      <div className="col-span-4 flex items-center gap-3">
        <div className="shrink-0">{fileTypeIcons[doc.fileType] || <FileText className="h-5 w-5" />}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{doc.fileName}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})} · {doc.uploadedBy}
          </p>
        </div>
      </div>
      <div className="col-span-2">
        <p className="text-sm truncate">{doc.caseName}</p>
        <p className="text-xs text-muted-foreground font-mono">{doc.caseId}</p>
      </div>
      <div className="col-span-2">
        <Badge variant="outline" className="text-[10px] mr-1">{doc.documentType}</Badge>
      </div>
      <div className="col-span-1 flex flex-wrap gap-1">
        {doc.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
        ))}
        {doc.tags.length > 2 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{doc.tags.length - 2}</span>
        )}
      </div>
      <div className="col-span-1">
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">v{doc.versionNumber}</span>
      </div>
      <div className="col-span-1 text-xs text-muted-foreground">{doc.size}</div>
      <div className="col-span-1 flex gap-1">
        {doc.aiSummary && (
          <span className="text-[8px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-bold" title="AI Processed">
            AI
          </span>
        )}
        {(doc.riskClauses?.length || 0) > 0 && (
          <span className="text-[8px] bg-red-100 text-red-700 px-1 py-0.5 rounded font-bold" title={`${doc.riskClauses!.length} risk(s)`}>
            ⚠{doc.riskClauses!.length}
          </span>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing Document Cloud...</p>
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
            <h1 className="text-2xl font-display font-semibold tracking-tight">Document Cloud</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered legal document management · Never lose a document again
            </p>
          </div>
          <Button 
            onClick={() => setUploadOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0"
          >
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Database, label: 'Total Docs', value: stats.total, color: 'text-blue-600 bg-blue-50' },
            { icon: Sparkles, label: 'AI Processed', value: stats.aiProcessed, color: 'text-purple-600 bg-purple-50' },
            { icon: Shield, label: 'Risk Flags', value: stats.riskFlags, color: 'text-red-600 bg-red-50' },
            { icon: BarChart3, label: 'Storage', value: `${stats.totalSize} MB`, color: 'text-green-600 bg-green-50' },
          ].map(stat => (
            <Card key={stat.label} className="p-3">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</p>
                  <p className="text-lg font-display font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={aiSearchMode 
                  ? "AI Search: e.g. 'Show me breach of contract cases'..."
                  : "Search documents, cases, content, keywords..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-9 ${aiSearchMode ? 'border-purple-300 focus-visible:ring-purple-400' : ''}`}
              />
              {aiSearchMode && (
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant={aiSearchMode ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setAiSearchMode(!aiSearchMode)}
                className={`gap-1.5 ${aiSearchMode ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
              >
                <Brain className="h-3.5 w-3.5" /> AI Search
              </Button>
              <Button 
                variant={groupByCase ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setGroupByCase(!groupByCase)}
                className="gap-1.5"
              >
                <Layers className="h-3.5 w-3.5" /> Group
              </Button>
              <div className="flex border rounded-md">
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-8 w-8 rounded-r-none" onClick={() => setViewMode('list')}>
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-8 w-8 rounded-l-none" onClick={() => setViewMode('grid')}>
                  <Grid3X3 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 overflow-x-auto">
            {documentTypeFilters.map(f => (
              <Button
                key={f}
                variant={activeType === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveType(f)}
                className={`text-xs ${activeType === f ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {f}
              </Button>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 items-center">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-muted/50 text-muted-foreground border-border hover:border-accent/40'
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button onClick={() => setSelectedTags([])} className="text-xs text-muted-foreground hover:text-foreground ml-1">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filtered.length} document{filtered.length !== 1 ? 's' : ''} found
            {search && <span className="ml-1">for "<span className="font-semibold text-foreground">{search}</span>"</span>}
          </p>
        </div>

        {/* Document List */}
        {!groupByCase ? (
          <Card>
            <CardContent className="p-0">
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-4">Document</div>
                <div className="col-span-2">Case</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-1">Tags</div>
                <div className="col-span-1">Ver</div>
                <div className="col-span-1">Size</div>
                <div className="col-span-1">Status</div>
              </div>
              <div className="divide-y">
                {filtered.map(renderDocumentRow)}
              </div>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No documents found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Grouped by Case */
          <div className="space-y-6">
            {groupedDocs && Object.entries(groupedDocs).map(([caseName, docs]) => (
              <Card key={caseName}>
                <CardHeader className="py-3 bg-muted/30 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-primary" />
                    {caseName}
                    <Badge variant="secondary" className="ml-auto text-[10px]">{docs.length} doc{docs.length !== 1 ? 's' : ''}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {docs.map(renderDocumentRow)}
                </CardContent>
              </Card>
            ))}
            {groupedDocs && Object.keys(groupedDocs).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No documents found</p>
              </div>
            )}
          </div>
        )}

        {/* Detail Panel */}
        <DocumentDetailPanel 
          document={selectedDoc}
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />

        {/* Upload Modal */}
        <UploadDocumentModal 
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
