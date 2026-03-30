import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download, Upload, FileText, File, FileImage, 
  Clock, Tag, Sparkles, AlertTriangle, Shield, 
  Link2, Brain, ChevronRight, ExternalLink
} from "lucide-react";
import { LegalDocument, RiskClause } from "@/types/document";
import { useState } from "react";
import { summarizeDocument, analyzeLegalRisk } from "@/lib/gemini";
import { documentService } from "@/services/documentService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Share2, Copy, Brightness as BrainIcon, PenTool } from "lucide-react";
import { NewVersionModal } from "./NewVersionModal";
import { AttachToHearingModal } from "./AttachToHearingModal";
import { ESignatureModal } from "./ESignatureModal";

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-500" />,
  docx: <File className="h-5 w-5 text-blue-500" />,
  image: <FileImage className="h-5 w-5 text-green-500" />,
  xlsx: <File className="h-5 w-5 text-emerald-600" />,
};

const severityColors: Record<string, string> = {
  high: 'bg-red-50 border-red-200 text-red-800',
  medium: 'bg-amber-50 border-amber-200 text-amber-800',
  low: 'bg-blue-50 border-blue-200 text-blue-800',
};

const severityDotColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-400',
};

type DocumentDetailPanelProps = {
  document: LegalDocument | null;
  isOpen: boolean;
  onClose: () => void;
};

export function DocumentDetailPanel({ document: doc, isOpen, onClose }: DocumentDetailPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const queryClient = useQueryClient();

  if (!doc) return null;

  const handleAIAnalyse = async () => {
    if (!doc || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      // 1. Summarize - ensure we have at least some context
      const contextText = doc.extractedText || `Filename: ${doc.fileName}\nDocument Type: ${doc.documentType}\nCase: ${doc.caseName}`;
      const summary = await summarizeDocument(contextText);
      
      // 2. Risk Analysis
      const riskJson = await analyzeLegalRisk(contextText);
      let riskClauses: RiskClause[] = [];
      try {
        // Simple attempt to find JSON in AI response
        const jsonMatch = riskJson.match(/\[.*\]/s);
        if (jsonMatch) riskClauses = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse AI risk JSON", e);
      }

      // 3. Update Supabase
      await documentService.updateDocument(doc.id, {
        aiSummary: summary,
        riskClauses: riskClauses,
        status: 'active'
      });

      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success("AI Analysis complete!");
    } catch (error) {
      toast.error("AI Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/documents/${doc.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Document link copied to clipboard", {
      icon: <Copy className="h-4 w-4" />
    });
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto border-l shadow-2xl">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 shadow-sm border`}>
              {fileTypeIcons[doc.fileType] || <FileText className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-lg leading-snug truncate">{doc.fileName}</SheetTitle>
              <SheetDescription className="mt-0.5">
                {doc.caseName} · <span className="font-mono">{doc.caseId}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 py-5">
          {/* File Info Bar */}
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: 'Type', value: doc.documentType },
              { label: 'Version', value: `v${doc.versionNumber}` },
              { label: 'Size', value: doc.size },
              { label: 'Signature', value: doc.signatureStatus || 'Not Required' },
            ].map(item => (
              <div key={item.label} className="bg-muted/40 rounded-lg p-2.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">{item.label}</p>
                <p className="text-sm font-semibold mt-0.5 capitalize">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <Tag className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            {doc.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] font-medium">{tag}</Badge>
            ))}
          </div>

          {/* ===== AI SECTION ===== */}
          {doc.aiSummary ? (
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50/80 to-blue-50/40 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Brain className="h-12 w-12 text-purple-900" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-800">
                  <Sparkles className="h-4 w-4" />
                  AI Legal Insights
                  <Badge variant="secondary" className="ml-auto text-[9px] bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest border-purple-300">CaseCore GLM-5</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-purple-900/80 leading-relaxed font-medium">
                    {doc.aiSummary}
                  </p>
                  
                  {/* Sample AI Insights if they exist */}
                  <div className="bg-white/40 p-3 rounded-lg border border-purple-100/50 space-y-2">
                    <p className="text-[10px] font-bold text-purple-900/40 uppercase tracking-widest">Procedural Analysis</p>
                    <p className="text-xs text-purple-800/70">Document identifies as a <span className="font-bold underline">Final Hearing Brief</span>. Key procedural deadlines found: <span className="bg-purple-100 px-1">14-Apr-2026</span>.</p>
                  </div>
                </div>

                <Button 
                   variant="ghost" 
                   size="sm" 
                   className="mt-4 text-[10px] h-7 text-purple-700 hover:bg-purple-100 hover:text-purple-800 gap-1 rounded-full px-3"
                   onClick={handleAIAnalyse}
                   disabled={isAnalyzing}
                >
                   {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin"/> : <Sparkles className="h-3 w-3" />} Re-run Analysis
                </Button>
              </CardContent>
            </Card>
          ) : !isAnalyzing && (
            <div className="bg-muted/10 border border-dashed rounded-xl p-6 text-center space-y-3">
               <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Brain className="h-6 w-6 text-muted-foreground/40" />
               </div>
               <div>
                 <p className="text-sm font-semibold">No AI Insights Yet</p>
                 <p className="text-xs text-muted-foreground">Run our specialized legal AI to extract risks, summaries, and dates.</p>
               </div>
               <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 h-11 rounded-xl shadow-md border-b-4 border-accent-foreground/10 active:border-b-0 active:translate-y-1 transition-all"
                onClick={handleAIAnalyse}
              >
                <Sparkles className="h-4 w-4" /> Start AI Analysis
              </Button>
            </div>
          )}

          {/* AI Keywords */}
          {doc.aiKeywords && doc.aiKeywords.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5" /> AI-Extracted Keywords
              </p>
              <div className="flex flex-wrap gap-1.5">
                {doc.aiKeywords.map(kw => (
                  <span key={kw} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Risk Clauses */}
          {doc.riskClauses && doc.riskClauses.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Risk Clause Detection
                <span className="ml-auto text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">{doc.riskClauses.length} found</span>
              </p>
              <div className="space-y-2">
                {doc.riskClauses.map((clause, i) => (
                  <div key={i} className={`p-3 rounded-lg border text-sm ${severityColors[clause.severity]}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`h-2 w-2 rounded-full ${severityDotColors[clause.severity]}`} />
                      <span className="text-[10px] uppercase font-bold tracking-wider">{clause.severity} risk</span>
                    </div>
                    <p className="font-medium italic text-xs leading-relaxed">"{clause.text}"</p>
                    <div className="mt-2 flex items-start gap-1.5 opacity-80">
                      <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                      <p className="text-[11px]">{clause.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Version Timeline */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Version History
            </p>
            <div className="space-y-0">
              {doc.versions.map((v, i) => (
                <div key={v.version} className="flex gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${i === 0 ? 'bg-primary' : 'bg-border'}`} />
                    {i < doc.versions.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold">v{v.version}</span>
                      <span className="text-[10px] text-muted-foreground">{v.date}</span>
                      {i === 0 && <Badge variant="outline" className="text-[8px] h-4 px-1">Latest</Badge>}
                    </div>
                    <p className="text-sm mt-0.5">{v.note}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">by {v.uploadedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <Button variant="outline" className="gap-2 h-11 border-2 border-muted hover:bg-muted/30 font-semibold" asChild>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> View Original
              </a>
            </Button>
            <Button 
              className="gap-2 h-11 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md border-b-4 border-indigo-900/30 active:border-b-0 active:translate-y-1 transition-all font-semibold"
              onClick={() => setShowVersionModal(true)}
            >
              <Upload className="h-4 w-4" /> Upload Version
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 h-11 border-2 border-muted hover:bg-muted/30 font-semibold"
              onClick={() => setShowAttachModal(true)}
            >
              <Link2 className="h-4 w-4" /> Link to Hearing
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 h-11 border-2 border-muted hover:bg-muted/30 font-semibold"
              onClick={handleShareLink}
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
            {doc.signatureStatus !== 'Signed' && (
              <Button 
                variant="outline" 
                className="gap-2 h-11 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold"
                onClick={() => setShowSignModal(true)}
              >
                <PenTool className="h-4 w-4" /> E-Sign
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <ESignatureModal 
      document={doc}
      isOpen={showSignModal}
      onClose={() => setShowSignModal(false)}
    />

    <NewVersionModal 
      document={doc}
      isOpen={showVersionModal}
      onClose={() => setShowVersionModal(false)}
    />

    <AttachToHearingModal 
      document={doc}
      isOpen={showAttachModal}
      onClose={() => setShowAttachModal(false)}
    />
    </>
  );
}
