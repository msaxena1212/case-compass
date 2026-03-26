import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LegalDocument } from "@/types/document";
import { useState } from "react";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";
import { Brain, Check, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type CompareDocumentsModalProps = {
  documents: LegalDocument[];
  isOpen: boolean;
  onClose: () => void;
};

export function CompareDocumentsModal({ documents, isOpen, onClose }: CompareDocumentsModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      toast.error("Please select at least 2 documents to compare.");
      return;
    }
    const docsToCompare = documents.filter(d => selectedIds.includes(d.id));
    setIsComparing(true);
    setResult(null);
    try {
      const comparison = await aiService.compareDocuments(docsToCompare);
      setResult(comparison);
      toast.success("AI Comparison Complete");
    } catch (err) {
      toast.error("Failed to compare documents");
    } finally {
      setIsComparing(false);
    }
  };

  const severityColors: Record<string, string> = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setResult(null);
        setSelectedIds([]);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Document Comparison
          </DialogTitle>
          <DialogDescription>
            Select multiple documents to analyze differences, similarities, and legal risks.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {!result ? (
            <div className="p-6 flex-1 flex flex-col">
              <h4 className="text-sm font-semibold mb-3">Select Documents ({selectedIds.length}/5 max)</h4>
              <ScrollArea className="flex-1 border rounded-md">
                <div className="divide-y">
                  {documents.map(doc => (
                    <div 
                      key={doc.id} 
                      className={`p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${selectedIds.includes(doc.id) ? 'bg-primary/5' : ''}`}
                      onClick={() => {
                        if (selectedIds.length >= 5 && !selectedIds.includes(doc.id)) {
                          toast.error("Maximum 5 documents can be compared at once.");
                          return;
                        }
                        toggleSelection(doc.id);
                      }}
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-medium truncate">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground truncate">{doc.caseName} • v{doc.versionNumber}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${selectedIds.includes(doc.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}>
                        {selectedIds.includes(doc.id) && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No documents available to compare.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600"/> Executive Summary
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-green-50/50">
                    <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                      <Check className="h-4 w-4" /> Key Similarities
                    </h4>
                    <ul className="space-y-2 text-sm text-green-900/80 list-disc pl-4">
                      {result.similarities?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4 bg-amber-50/50">
                    <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Key Differences
                    </h4>
                    <ul className="space-y-2 text-sm text-amber-900/80 list-disc pl-4">
                      {result.differences?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                </div>

                {result.risks && result.risks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Identified Legal Risks
                    </h4>
                    <div className="space-y-2">
                      {result.risks.map((r: any, i: number) => (
                        <div key={i} className={`p-3 rounded-lg border text-sm flex items-start gap-3 ${severityColors[r.severity] || severityColors.medium}`}>
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider mb-1 block">{r.severity} Risk</span>
                            <span className="font-medium">{r.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0">
          <Button variant="outline" onClick={() => {
            if (result) {
              setResult(null);
            } else {
              onClose();
            }
          }} disabled={isComparing}>
            {result ? "Back to Selection" : "Cancel"}
          </Button>
          {!result && (
            <Button 
               onClick={handleCompare} 
               disabled={selectedIds.length < 2 || isComparing}
               className="bg-purple-600 text-white hover:bg-purple-700"
            >
              {isComparing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
              Analyze {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
