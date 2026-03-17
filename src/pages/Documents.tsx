import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Plus, FileText, File, FileImage, Filter,
  Download, Eye, Clock, Tag, Upload, X, ChevronDown, FolderOpen
} from "lucide-react";
import { useState } from "react";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "docx" | "image" | "contract" | "evidence";
  case: string;
  caseId: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  version: number;
  versions: { version: number; date: string; uploadedBy: string; note: string }[];
  status: "active" | "archived" | "pending";
}

const documentsData: Document[] = [
  {
    id: "DOC-001", name: "Petition_Sharma_vs_State.pdf", type: "pdf",
    case: "Sharma vs. State of Maharashtra", caseId: "C-2024-0847",
    tags: ["petition", "criminal", "high-court"], uploadedBy: "Adv. Kumar",
    uploadedAt: "Mar 10, 2026", size: "2.4 MB", version: 3, status: "active",
    versions: [
      { version: 3, date: "Mar 10, 2026", uploadedBy: "Adv. Kumar", note: "Final revised petition" },
      { version: 2, date: "Feb 28, 2026", uploadedBy: "Adv. Kumar", note: "Added additional grounds" },
      { version: 1, date: "Jan 15, 2024", uploadedBy: "Adv. Kumar", note: "Initial filing" },
    ],
  },
  {
    id: "DOC-002", name: "Merger_Agreement_Draft_v2.docx", type: "docx",
    case: "Patel Industries Ltd. Merger", caseId: "C-2024-0846",
    tags: ["contract", "merger", "corporate"], uploadedBy: "Adv. Mehta",
    uploadedAt: "Mar 8, 2026", size: "1.8 MB", version: 2, status: "active",
    versions: [
      { version: 2, date: "Mar 8, 2026", uploadedBy: "Adv. Mehta", note: "Board-approved revisions" },
      { version: 1, date: "Feb 10, 2024", uploadedBy: "Adv. Mehta", note: "Initial draft" },
    ],
  },
  {
    id: "DOC-003", name: "Property_Survey_Report.pdf", type: "pdf",
    case: "Singh Property Dispute", caseId: "C-2024-0845",
    tags: ["evidence", "survey", "civil"], uploadedBy: "Adv. Kumar",
    uploadedAt: "Mar 5, 2026", size: "5.1 MB", version: 1, status: "active",
    versions: [{ version: 1, date: "Mar 5, 2026", uploadedBy: "Adv. Kumar", note: "Original survey report" }],
  },
  {
    id: "DOC-004", name: "Site_Photos_Evidence.zip", type: "image",
    case: "Singh Property Dispute", caseId: "C-2024-0845",
    tags: ["evidence", "photos", "civil"], uploadedBy: "Adv. Kumar",
    uploadedAt: "Mar 4, 2026", size: "12.3 MB", version: 1, status: "active",
    versions: [{ version: 1, date: "Mar 4, 2026", uploadedBy: "Adv. Kumar", note: "Site photographs" }],
  },
  {
    id: "DOC-005", name: "Divorce_Settlement_Agreement.docx", type: "contract",
    case: "Gupta vs. Gupta Divorce", caseId: "C-2024-0844",
    tags: ["contract", "settlement", "family"], uploadedBy: "Adv. Joshi",
    uploadedAt: "Mar 1, 2026", size: "890 KB", version: 4, status: "pending",
    versions: [
      { version: 4, date: "Mar 1, 2026", uploadedBy: "Adv. Joshi", note: "Revised terms per mediation" },
      { version: 3, date: "Feb 20, 2026", uploadedBy: "Adv. Joshi", note: "Counter-proposal" },
      { version: 2, date: "Feb 5, 2026", uploadedBy: "Adv. Joshi", note: "Client review comments" },
      { version: 1, date: "Dec 20, 2023", uploadedBy: "Adv. Joshi", note: "Initial draft" },
    ],
  },
  {
    id: "DOC-006", name: "IP_Registration_Certificate.pdf", type: "pdf",
    case: "Tech Solutions IP Infringement", caseId: "C-2024-0843",
    tags: ["evidence", "IP", "corporate"], uploadedBy: "Adv. Kumar",
    uploadedAt: "Feb 28, 2026", size: "340 KB", version: 1, status: "active",
    versions: [{ version: 1, date: "Feb 28, 2026", uploadedBy: "Adv. Kumar", note: "Original certificate" }],
  },
  {
    id: "DOC-007", name: "Insurance_Claim_Settlement.pdf", type: "pdf",
    case: "Desai Insurance Claim", caseId: "C-2024-0841",
    tags: ["settlement", "insurance", "closed"], uploadedBy: "Adv. Joshi",
    uploadedAt: "Jan 15, 2026", size: "1.2 MB", version: 1, status: "archived",
    versions: [{ version: 1, date: "Jan 15, 2026", uploadedBy: "Adv. Joshi", note: "Final settlement document" }],
  },
];

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-destructive" />,
  docx: <File className="h-5 w-5 text-info" />,
  image: <FileImage className="h-5 w-5 text-success" />,
  contract: <FileText className="h-5 w-5 text-accent" />,
  evidence: <FileImage className="h-5 w-5 text-warning" />,
};

const allTags = Array.from(new Set(documentsData.flatMap((d) => d.tags)));
const typeFilters = ["All", "pdf", "docx", "image", "contract"];

export default function Documents() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = documentsData.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.case.toLowerCase().includes(search.toLowerCase()) ||
      d.caseId.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === "All" || d.type === activeType;
    const matchTags =
      selectedTags.length === 0 || selectedTags.some((t) => d.tags.includes(t));
    return matchSearch && matchType && matchTags;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {documentsData.length} documents · {documentsData.filter((d) => d.status === "active").length} active
            </p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0">
                <Upload className="h-4 w-4" /> Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drop files here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, Images up to 50MB</p>
                </div>
                <div className="space-y-2">
                  <Label>Link to Case</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select case..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C-2024-0847">C-2024-0847 · Sharma vs. State</SelectItem>
                      <SelectItem value="C-2024-0846">C-2024-0846 · Patel Merger</SelectItem>
                      <SelectItem value="C-2024-0845">C-2024-0845 · Singh Property</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input placeholder="Add tags separated by commas..." />
                </div>
                <div className="space-y-2">
                  <Label>Version Note</Label>
                  <Input placeholder="e.g., Initial draft, Revised petition..." />
                </div>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setUploadOpen(false)}>
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by document name, case title, or case ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {typeFilters.map((f) => (
                <Button
                  key={f}
                  variant={activeType === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveType(f)}
                  className={activeType === f ? "bg-primary text-primary-foreground" : ""}
                >
                  {f === "All" ? "All" : f.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 items-center">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-muted/50 text-muted-foreground border-border hover:border-accent/40"
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

        {/* Documents List */}
        <Card>
          <CardContent className="p-0">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-4">Document</div>
              <div className="col-span-3">Case</div>
              <div className="col-span-2">Tags</div>
              <div className="col-span-1">Version</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-1">Actions</div>
            </div>

            <div className="divide-y">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer items-center"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="shrink-0">{typeIcons[doc.type]}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.uploadedAt} · {doc.uploadedBy}</p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm truncate">{doc.case}</p>
                    <p className="text-xs text-muted-foreground font-mono">{doc.caseId}</p>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {doc.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                    ))}
                    {doc.tags.length > 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{doc.tags.length - 2}</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">v{doc.version}</span>
                  </div>
                  <div className="col-span-1 text-xs text-muted-foreground">{doc.size}</div>
                  <div className="col-span-1 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No documents found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Version History Panel */}
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedDoc && typeIcons[selectedDoc.type]}
                <span className="truncate">{selectedDoc?.name}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedDoc && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Case</p>
                    <p className="font-medium">{selectedDoc.case}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <StatusBadge status={selectedDoc.status} />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Size</p>
                    <p>{selectedDoc.size}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Current Version</p>
                    <p className="font-mono">v{selectedDoc.version}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Version History</p>
                  <div className="space-y-0">
                    {selectedDoc.versions.map((v, i) => (
                      <div key={v.version} className="flex gap-3 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${i === 0 ? "bg-accent" : "bg-border"}`} />
                          {i < selectedDoc.versions.length - 1 && <div className="w-px flex-1 bg-border" />}
                        </div>
                        <div className="pb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium">v{v.version}</span>
                            <span className="text-xs text-muted-foreground">{v.date}</span>
                          </div>
                          <p className="text-sm mt-0.5">{v.note}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">by {v.uploadedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <Button className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Upload className="h-4 w-4" /> Upload New Version
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
