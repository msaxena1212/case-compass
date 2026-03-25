import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Mail, Smartphone, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { communicationService } from "@/services/communicationService";
import { clientService } from "@/services/clientService";
import { caseService } from "@/services/caseService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationChannel } from "@/types/communication";

interface SendCommunicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId?: string;
  clientId?: string;
}

export function SendCommunicationModal({ open, onOpenChange, caseId: initialCaseId, clientId: initialClientId }: SendCommunicationModalProps) {
  const [caseId, setCaseId] = useState(initialCaseId || "");
  const [clientId, setClientId] = useState(initialClientId || "");
  const [channel, setChannel] = useState<NotificationChannel>("WhatsApp");
  const [content, setContent] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getAllClients,
    enabled: open
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: caseService.getAllCases,
    enabled: open
  });

  const sendMutation = useMutation({
    mutationFn: (newLog: any) => communicationService.logCommunication(newLog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-logs'] });
      toast.success(`Message sent successfully via ${channel}.`);
      setContent("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to send message: ${error.message}`);
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !content) {
      toast.error("Recipient and Message Content are required.");
      return;
    }

    const targetClient = clients.find((c: any) => c.id === clientId);
    
    const newLog = {
      case_id: caseId !== "none" ? (caseId || null) : null,
      client_id: clientId,
      sender: "Adv. Kumar",
      receiver: targetClient?.name || "Client",
      content: content,
      channel: channel,
      status: "Delivered",
      timestamp: new Date().toISOString(),
      type: channel === 'Email' ? 'Email' : 'WhatsApp',
      summary: content.slice(0, 50) + "..."
    };

    sendMutation.mutate(newLog as any);
  };

  const generateWithAi = () => {
    if (!caseId || caseId === "none") {
      toast.error("Please select a case first to generate smart content.");
      return;
    }
    
    setIsAiGenerating(true);
    setTimeout(() => {
      const targetCase = cases.find((c: any) => c.id === caseId);
      setContent(`Dear Client, regarding the case "${targetCase?.title}", we wanted to update you that the recent hearing outcomes have been favorable. We are proceeding with the next stage of documentation and will keep you posted.`);
      setIsAiGenerating(false);
      toast.info("AI generated a draft based on the case profile.");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-accent" /> Send Client Update
          </DialogTitle>
          <DialogDescription>
            Communicate directly with clients via WhatsApp, Email, or SMS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Case Link (Optional)</Label>
              <Select value={caseId} onValueChange={setCaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- General --</SelectItem>
                  {cases.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Communication Channel</Label>
            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg border">
              {(['WhatsApp', 'Email', 'SMS'] as const).map(ch => (
                <Button
                  key={ch}
                  type="button"
                  variant={channel === ch ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex-1 gap-2 rounded-md h-8 text-xs font-bold ${channel === ch ? 'bg-white shadow-sm text-accent font-black' : 'text-muted-foreground'}`}
                  onClick={() => setChannel(ch)}
                >
                  {ch === 'WhatsApp' && <MessageCircle className="h-3.5 w-3.5" />}
                  {ch === 'Email' && <Mail className="h-3.5 w-3.5" />}
                  {ch === 'SMS' && <Smartphone className="h-3.5 w-3.5" />}
                  {ch}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Message Content *</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-7 text-[10px] font-bold uppercase tracking-wider text-accent gap-1.5 hover:bg-accent/5 transition-colors"
                onClick={generateWithAi}
                disabled={isAiGenerating}
              >
                <Sparkles className="h-3 w-3" /> Draft with AI
              </Button>
            </div>
            <Textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[120px] text-sm resize-none"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <Send className="h-4 w-4" /> Send Update via {channel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
