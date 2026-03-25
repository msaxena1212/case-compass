import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AICapability, AIMessage, AICapabilityType } from "@/types/ai";
import { aiService, aiCapabilities } from "@/services/aiService";
import { generateLegalContentStream, isGeminiAvailable } from "@/lib/gemini";
import { useQuery } from "@tanstack/react-query";
import { caseService } from "@/services/caseService";
import { 
  Bot, Send, Sparkles, Copy, Download, Paperclip, 
  ChevronRight, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import { toast } from "sonner";

// Simple markdown renderer (converts **bold**, ## headers, bullets)
function renderMarkdown(text: string) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('## '))
        return <h3 key={i} className="text-base font-bold mt-4 mb-1 text-foreground">{line.replace('## ', '')}</h3>;
      if (line.startsWith('### '))
        return <h4 key={i} className="text-sm font-bold mt-3 mb-0.5 text-foreground">{line.replace('### ', '')}</h4>;
      if (line.startsWith('> '))
        return <blockquote key={i} className="border-l-2 border-accent/40 pl-3 my-2 text-xs italic text-muted-foreground">{line.replace('> ', '')}</blockquote>;
      if (line.startsWith('- ') || line.match(/^\d+\. /))
        return <li key={i} className="ml-4 text-sm">{line.replace(/^[-\d.]+\s/, '')}</li>;
      if (line === '---')
        return <hr key={i} className="my-3 border-border/40" />;
      if (line.trim() === '')
        return <div key={i} className="h-1" />;
      
      // Inline bold
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <p key={i} className="text-sm leading-relaxed">
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-foreground">{p}</strong> : p)}
        </p>
      );
    });
}

export default function AIAssistant() {
  const [selectedCapability, setSelectedCapability] = useState<AICapabilityType>('legal-qa');
  const [caseId, setCaseId] = useState<string>('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: cases = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: caseService.getAllCases
  });

  const capability = aiCapabilities.find(c => c.type === selectedCapability)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: AIMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      capability: selectedCapability
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    setStreamingContent('');

    let accumulated = '';
    try {
      // Check if Gemini is available and key is provided
      if (!isGeminiAvailable) {
        console.warn("Gemini API key not found or invalid. Falling back to Demo Mode.");
        toast.info("Running in Demo Mode (Mock AI)", {
          description: "Real AI requires a valid Gemini API key in the .env file."
        });
        
        const aiResponse = await aiService.simulateAIRequest(
          selectedCapability, 
          input, 
          caseId === 'none' ? undefined : caseId,
          (chunk) => setStreamingContent(prev => prev + chunk)
        );
        
        setStreamingContent('');
        setIsThinking(false);
        setMessages(prev => [...prev, aiResponse]);
        return;
      }

      // Create context prompt based on selected capability
      const prompt = `Context: Role is a highly capable Indian Legal Assistant. 
                      Capability: ${capability.label}. 
                      User Query: ${input} 
                      ${caseId ? `Additional Case Context ID: ${caseId}` : ''}`;

      const stream = generateLegalContentStream(prompt);
      
      for await (const chunk of stream) {
        accumulated += chunk;
        setStreamingContent(accumulated);
      }

      setStreamingContent('');
      setIsThinking(false);
      
      const aiResponse: AIMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: accumulated,
        timestamp: new Date().toISOString(),
        capability: selectedCapability,
        metadata: {
          confidence: 0.95,
          sources: ['Case Compass Knowledge Bank', 'Indian Penal Code', 'Civil Procedure Code'],
          disclaimer: "This AI response is for informational purposes only and does not constitute formal legal advice. Please verify with a qualified advocate."
        }
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      
      const errorMessage = error?.message || "There was an issue with the AI service.";
      
      toast.warning("AI Generation failed. Switching to Demo Mode.", {
        description: `Error: ${errorMessage.slice(0, 100)}${errorMessage.length > 100 ? '...' : ''}`
      });
      
      // Secondary fallback if the real API fails mid-stream or during initialization
      try {
        const fallbackResponse = await aiService.simulateAIRequest(
          selectedCapability, 
          input, 
          caseId === 'none' ? undefined : caseId,
          (chunk) => setStreamingContent(prev => prev + chunk)
        );
        
        setStreamingContent('');
        setIsThinking(false);
        setMessages(prev => [...prev, fallbackResponse]);
      } catch (innerError) {
        toast.error("Complete AI failure. Please check your connection.");
        setIsThinking(false);
        setStreamingContent('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const confidenceColor = (c: number) => {
    if (c > 0.9) return 'text-emerald-600';
    if (c > 0.75) return 'text-amber-600';
    return 'text-red-600';
  };

  const getCapabilityColor = (color: string) => {
    const colors: Record<string, string> = {
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      rose: 'bg-rose-50 border-rose-200 text-rose-700',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      amber: 'bg-amber-50 border-amber-200 text-amber-700',
    };
    return colors[color] || 'bg-muted text-muted-foreground';
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)] gap-0 -mx-6 -my-6">
        
        {/* Sidebar: Capabilities */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <aside className="w-72 border-r bg-muted/20 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-5 border-b bg-gradient-to-br from-accent/10 to-transparent">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">AI Legal Assistant</h2>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Powered by LegalAI™</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3">Select Capability</p>
              {aiCapabilities.map(cap => (
                <button
                  key={cap.type}
                  onClick={() => { setSelectedCapability(cap.type); setMessages([]); setStreamingContent(''); }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 group ${
                    selectedCapability === cap.type 
                      ? getCapabilityColor(cap.color) + ' shadow-sm' 
                      : 'bg-white border-border/50 hover:border-accent/30 hover:bg-accent/5'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl leading-none mt-0.5">{cap.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight">{cap.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{cap.description}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 mt-0.5 transition-transform ${selectedCapability === cap.type ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}`} />
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t mt-auto space-y-3">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Context (Optional)</p>
              <Select value={caseId} onValueChange={setCaseId}>
                <SelectTrigger className="h-9 text-xs bg-white">
                  <SelectValue placeholder="Link a case..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No case link</SelectItem>
                  {cases.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {caseId && caseId !== 'none' && (
                <div className="text-[10px] flex items-center gap-1.5 text-accent font-bold">
                  <Paperclip className="h-3 w-3" /> AI will use case data as context
                </div>
              )}
            </div>
          </aside>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0 bg-muted/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{capability.icon}</span>
                <div>
                  <h3 className="text-sm font-bold">{capability.label}</h3>
                  <p className="text-[10px] text-muted-foreground">{capability.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-emerald-200 text-emerald-600 bg-emerald-50 gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> AI Online
              </Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && !isThinking && !streamingContent && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/20">
                    <Sparkles className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Ready to Assist</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-6">
                    {capability.description}
                  </p>
                  <Button 
                    variant="outline" 
                    className="text-sm font-medium border-accent/30 text-accent hover:bg-accent/5"
                    onClick={() => setInput(capability.placeholder)}
                  >
                    Try: "{capability.placeholder.slice(0, 50)}..."
                  </Button>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold mt-1 ${
                    msg.role === 'user' ? 'bg-accent text-accent-foreground' : 'bg-muted border border-border text-foreground'
                  }`}>
                    {msg.role === 'user' ? 'AK' : '⚖️'}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-accent text-accent-foreground rounded-tr-none' 
                        : 'bg-white border border-border/60 rounded-tl-none'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <div className="text-sm leading-relaxed prose-sm max-w-none">
                          {renderMarkdown(msg.content)}
                        </div>
                      )}
                    </div>

                    {/* AI Message Footer */}
                    {msg.role === 'assistant' && msg.metadata && (
                      <div className="flex flex-wrap items-center gap-3 px-1">
                        <span className={`text-[10px] font-bold ${confidenceColor(msg.metadata.confidence || 0)}`}>
                          {Math.round((msg.metadata.confidence || 0) * 100)}% Confidence
                        </span>
                        {msg.metadata.sources?.slice(0, 2).map(src => (
                          <span key={src} className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                            📚 {src}
                          </span>
                        ))}
                        <button 
                          onClick={() => copyToClipboard(msg.content)}
                          className="text-muted-foreground hover:text-foreground transition-colors ml-auto"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {msg.metadata?.disclaimer && (
                      <div className="flex items-start gap-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5 max-w-sm">
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{msg.metadata.disclaimer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming / Thinking state */}
              {(isThinking || streamingContent) && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-sm shrink-0 mt-1">⚖️</div>
                  <div className="max-w-[80%] bg-white border border-border/60 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    {streamingContent ? (
                      <div className="text-sm leading-relaxed prose-sm max-w-none">
                        {renderMarkdown(streamingContent)}
                        <span className="inline-block h-3.5 w-0.5 bg-accent animate-pulse align-middle ml-0.5" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        <span>AI is analyzing your query...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t bg-muted/10 shrink-0">
              <div className="flex gap-3 items-end max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`${capability.placeholder}`}
                    className="resize-none min-h-[52px] max-h-[140px] pr-4 bg-white text-sm rounded-xl border-border/60 focus-visible:ring-accent/30 shadow-sm"
                    rows={2}
                    disabled={isThinking}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className="h-13 px-4 py-3 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm shrink-0"
                >
                  {isThinking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Press <kbd className="px-1 py-0.5 bg-muted border rounded text-[9px] font-mono">Ctrl+Enter</kbd> to send · AI outputs are for guidance only
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
