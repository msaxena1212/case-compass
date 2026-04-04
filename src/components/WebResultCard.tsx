import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  BookmarkPlus,
  Check,
  Globe,
  ChevronDown,
  ChevronUp,
  Loader2,
  Scale,
  FileText,
  BookOpen,
} from "lucide-react";
import { WebSearchResult } from "@/services/webSearchService";
import { knowledgeBaseService } from "@/services/knowledgeBaseService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface WebResultCardProps {
  result: WebSearchResult;
  index: number;
}

export function WebResultCard({ result, index }: WebResultCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveType, setSaveType] = useState<"Judgment" | "Act" | "Template">("Judgment");
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async (type: "Judgment" | "Act" | "Template") => {
    setIsSaving(true);
    setShowTypeSelector(false);
    try {
      await knowledgeBaseService.saveWebResultToKnowledgeBase(
        {
          title: result.title,
          snippet: result.snippet,
          url: result.url,
          source: result.source,
        },
        type
      );
      setIsSaved(true);
      toast.success("Saved to Knowledge Bank", {
        description: `"${result.title.slice(0, 50)}..." has been added to your databank.`,
      });
      // Invalidate the knowledge base cache so it shows up immediately
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save", {
        description: "There was an error saving this result. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const typeIcons = {
    Judgment: <Scale className="h-3 w-3" />,
    Act: <BookOpen className="h-3 w-3" />,
    Template: <FileText className="h-3 w-3" />,
  };

  const typeColors = {
    Judgment:
      "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
    Act: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    Template: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  };

  return (
    <Card
      className="group border-border/50 bg-white hover:shadow-md hover:border-accent/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <Globe className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium truncate mb-0.5">
              {result.displayUrl}
            </p>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-accent hover:underline underline-offset-2 leading-snug line-clamp-2 group-hover:text-accent/80 transition-colors"
            >
              {result.title}
            </a>
          </div>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-accent" />
          </a>
        </div>

        {/* Snippet */}
        <p
          className={`text-xs text-muted-foreground leading-relaxed mb-3 ${
            isExpanded ? "" : "line-clamp-3"
          }`}
        >
          {result.snippet}
        </p>

        {result.snippet && result.snippet.length > 180 && (
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="text-[10px] font-semibold text-accent hover:underline flex items-center gap-1 mb-3"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}

        {/* URL chip */}
        <div className="flex items-center gap-1.5 bg-muted/50 border border-border/40 rounded-md px-2.5 py-1.5 mb-4 max-w-full overflow-hidden">
          <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-muted-foreground hover:text-foreground truncate flex-1 min-w-0"
          >
            {result.url}
          </a>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-dashed">
            Web Result
          </Badge>

          {isSaved ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <Check className="h-4 w-4" />
              Saved to Databank
            </div>
          ) : (
            <div className="relative">
              {showTypeSelector ? (
                <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-150">
                  <span className="text-[10px] text-muted-foreground font-medium mr-1">
                    Save as:
                  </span>
                  {(["Judgment", "Act", "Template"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleSave(type)}
                      disabled={isSaving}
                      className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md border transition-colors ${typeColors[type]}`}
                    >
                      {typeIcons[type]} {type}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowTypeSelector(false)}
                    className="text-[10px] text-muted-foreground ml-1 hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold gap-1.5 border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground transition-all"
                  onClick={() => setShowTypeSelector(true)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <BookmarkPlus className="h-3.5 w-3.5" />
                  )}
                  {isSaving ? "Saving..." : "Save to Knowledge Bank"}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
