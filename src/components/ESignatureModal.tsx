import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LegalDocument } from "@/types/document";
import { useState } from "react";
import { documentService } from "@/services/documentService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PenTool, Loader2 } from "lucide-react";

type ESignatureModalProps = {
  document: LegalDocument | null;
  isOpen: boolean;
  onClose: () => void;
};

export function ESignatureModal({ document, isOpen, onClose }: ESignatureModalProps) {
  const [signature, setSignature] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const queryClient = useQueryClient();

  if (!document) return null;

  const handleSign = async () => {
    if (!signature.trim()) {
      toast.error("Please enter your signature");
      return;
    }
    setIsSigning(true);
    try {
      await documentService.updateDocument(document.id, {
        signatureStatus: 'Signed',
        signedBy: signature,
        signedAt: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success("Document signed successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to sign document.");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            E-Sign Document
          </DialogTitle>
          <DialogDescription>
            Type your full legal name below to electronically sign the document "{document.fileName}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input 
            placeholder="John Doe" 
            value={signature} 
            onChange={e => setSignature(e.target.value)}
            className="font-serif italic text-2xl h-14"
          />
          <p className="text-[10px] text-muted-foreground mt-3 text-center px-4">
            By typing your name, you agree that this constitutes a legally binding electronic signature equivalent to your handwritten signature.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSigning}>Cancel</Button>
          <Button onClick={handleSign} disabled={!signature.trim() || isSigning}>
            {isSigning ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <PenTool className="h-4 w-4 mr-2" />}
            Execute Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
