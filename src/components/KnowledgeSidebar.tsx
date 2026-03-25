import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { KnowledgeItem } from "@/types/knowledge";
import { 
  X, 
  Scale, 
  FileText, 
  BookOpen, 
  Download, 
  Paperclip, 
  Sparkles,
  Eye,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface KnowledgeSidebarProps {
  item: KnowledgeItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function KnowledgeSidebar({ item, isOpen, onClose }: KnowledgeSidebarProps) {
  if (!item) return null;

  const handleAttach = () => {
    toast.success(`Attached "${item.title}" to active case.`);
    onClose();
  };

  const handleDownload = () => {
    toast.success(`Downloading ${item.type} template...`);
  };

  const getIcon = () => {
    if (item.type === 'Judgment') return <Scale className="h-5 w-5 text-indigo-500" />;
    if (item.type === 'Template') return <FileText className="h-5 w-5 text-emerald-500" />;
    return <BookOpen className="h-5 w-5 text-amber-500" />;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90vw] sm:max-w-[600px] overflow-y-auto sm:p-8 border-l shadow-2xl">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-md">{getIcon()}</div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.type}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={handleAttach}>
              <Paperclip className="h-3.5 w-3.5" /> Attach to Case
            </Button>
            {item.type === 'Template' && (
              <Button size="sm" className="h-8 gap-1.5" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" /> Use Template
              </Button>
            )}
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-4 mb-8">
          <SheetTitle className="text-2xl font-display leading-tight">{item.title}</SheetTitle>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {new Date(item.dateAdded).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {item.views} views
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {item.tags.map(t => (
                <span key={t} className="px-2 py-0.5 bg-accent/10 text-accent rounded-full font-bold">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Summary (If Judgment) */}
        {item.aiSummary && (
          <div className="mb-8 bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-24 w-24 text-indigo-600" />
            </div>
            <div className="relative z-10">
              <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-2">
                <Sparkles className="h-4 w-4 text-indigo-600" /> Executive Summary
              </h4>
              <p className="text-sm text-indigo-950/80 leading-relaxed font-medium">
                {item.aiSummary}
              </p>
            </div>
          </div>
        )}

        {/* Linked Sections */}
        {item.linkedSections && item.linkedSections.length > 0 && (
          <div className="mb-6 space-y-3">
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Applicable Law</h4>
            <div className="space-y-2">
              {item.linkedSections.map(sec => (
                <div key={sec} className="p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors flex items-start gap-3">
                   <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                   <div>
                     <p className="text-sm font-bold">{sec.replace('_', ' ').toUpperCase()}</p>
                     <p className="text-xs text-muted-foreground mt-0.5">Click to view full bare act details (Simulation)</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Full Content Content */}
        <div>
          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4">Complete Text</h4>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            {item.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 leading-relaxed whitespace-pre-wrap">{paragraph}</p>
            ))}
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
}
