import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Send, Command } from "lucide-react";

interface AILegalAssistantProps {
  onSearch: (query: string) => void;
}

export function AILegalAssistant({ onSearch }: AILegalAssistantProps) {
  const [query, setQuery] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Simulate AI understanding the query before returning DB results
    setIsAiThinking(true);
    setInsight(null);
    
    setTimeout(() => {
      onSearch(query);
      setIsAiThinking(false);
      
      // Fake AI insights based on keywords
      if (query.toLowerCase().includes('cheque') || query.toLowerCase().includes('138')) {
        setInsight("Under Section 138 of the NI Act, a legal notice must be sent within 30 days of the cheque bounce memo. I've found landmark judgments on territorial jurisdiction and a standard drafting template below.");
      } else if (query.toLowerCase().includes('contract') || query.toLowerCase().includes('nda')) {
        setInsight("For corporate NDAs or breaches of the Contract Act, I've pulled standard firm templates and the bare act references you might need.");
      } else {
        setInsight("I scanned past firm cases, acts, and Supreme Court judgments for your query. Here are the most relevant matches.");
      }
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <Card className="border-accent/40 bg-gradient-to-br from-accent/5 to-transparent overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <form onSubmit={handleSearch} className="flex relative items-center p-2">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center">
              {isAiThinking ? (
                <Sparkles className="h-5 w-5 text-accent animate-pulse" />
              ) : (
                <Search className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a legal question or search judgments, templates, acts... (e.g. 'cheque bounce defense')"
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base py-6 px-2"
            />
            
            <div className="hidden sm:flex items-center gap-1.5 px-3 mr-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground border border-border/50 h-7">
               <Command className="h-3 w-3" /> K
            </div>
            
            <Button 
              type="submit" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 px-6 rounded-md shrink-0 transition-all font-semibold"
              disabled={isAiThinking}
            >
              {isAiThinking ? "Searching..." : <span className="flex items-center gap-2">Ask AI <Send className="h-4 w-4" /></span>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Contextual Insight Bubble */}
      {insight && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground leading-relaxed">{insight}</p>
          </div>
        </div>
      )}
    </div>
  );
}
