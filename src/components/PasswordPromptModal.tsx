import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Lock, Loader2, ShieldCheck } from "lucide-react";

type PasswordPromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  onUnlock: () => void;
};

export function PasswordPromptModal({ isOpen, onClose, documentName, onUnlock }: PasswordPromptModalProps) {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleUnlock = async () => {
    if (!password.trim()) {
      setError("Please enter the document password.");
      return;
    }
    setIsVerifying(true);
    setError("");
    // Simulate verification
    await new Promise(r => setTimeout(r, 800));
    // In demo mode, accept any password
    setIsVerifying(false);
    setPassword("");
    onUnlock();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setPassword("");
        setError("");
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-600" />
            Protected Document
          </DialogTitle>
          <DialogDescription>
            "{documentName}" is password protected. Enter the password to access this document.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <Input 
            type="password"
            placeholder="Enter document password..."
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => { if (e.key === 'Enter') handleUnlock(); }}
          />
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>This document was encrypted upon upload. Only users with the correct password can view it.</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUnlock} disabled={!password.trim() || isVerifying} className="gap-2">
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Unlock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
