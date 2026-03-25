import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertTriangle, TrendingUp, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AIInsightsWidget({ insights, isLoading }: { insights: any[], isLoading?: boolean }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border-accent/40 bg-gradient-to-br from-accent/5 to-transparent overflow-hidden">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-3">
           <Sparkles className="h-6 w-6 text-accent animate-pulse" />
           <p className="text-[10px] uppercase font-bold text-muted-foreground animate-pulse tracking-widest">Synthesizing Strategic Intelligence...</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.length === 0) return null;

  return (
    <Card className="border-accent/40 bg-gradient-to-br from-accent/5 to-transparent overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display font-bold flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Lightbulb className="h-3.5 w-3.5 text-accent" />
          </div>
          Strategic Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map(i => {
          let Icon = Lightbulb;
          let colorTheme = "text-accent bg-accent/10 border-accent/20";
          let textColor = "text-foreground";

          if (i.type === 'Risk') {
            Icon = AlertTriangle;
            colorTheme = "text-destructive bg-destructive/10 border-destructive/20";
            textColor = "text-destructive-foreground";
          } else if (i.type === 'Opportunity') {
            Icon = TrendingUp;
            colorTheme = "text-success bg-success/10 border-success/20";
            textColor = "text-success-foreground";
          }

          return (
            <div key={i.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-lg border bg-white/60 backdrop-blur-sm shadow-sm transition-colors hover:bg-white/80">
               <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${colorTheme}`}>
                 <Icon className="h-4 w-4" />
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium leading-snug">{i.message}</p>
                 <span className={`text-[9px] uppercase font-bold tracking-wider mt-1 block ${textColor}`}>{i.type}</span>
               </div>
               <Button 
                variant="ghost" 
                size="sm" 
                className="shrink-0 h-8 text-xs font-semibold hover:bg-transparent hover:underline underline-offset-4 px-2"
                onClick={() => navigate(i.actionLink)}
               >
                 {i.actionText} <ArrowRight className="h-3 w-3 ml-1" />
               </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
