import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { documentService } from "@/services/documentService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileText, Loader2 } from "lucide-react";
import { LegalDocument } from "@/types/document";

type NewVersionModalProps = {
  document: LegalDocument;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function NewVersionModal({ document: doc, isOpen, onClose, onSuccess }: NewVersionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ docData, file }: { docData: any, file: File }) => {
      // In a real app, this would be a specific versioning service call
      // For this sample, we just update the existing document with a new version number
      const newVersion = {
        version: doc.versionNumber + 1,
        date: new Date().toISOString(),
        note: note || "New version uploaded",
        uploadedBy: "Adv. Kumar"
      };
      
      const updates = {
        versionNumber: doc.versionNumber + 1,
        versions: [newVersion, ...doc.versions],
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        updatedAt: new Date().toISOString()
      };

      return documentService.updateDocument(doc.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(`Version v${doc.versionNumber + 1} uploaded successfully`);
      setFile(null);
      setNote('');
      setIsUploading(false);
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Version upload failed: ${error.message}`);
      setIsUploading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate({ docData: doc, file });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Upload New Version
          </DialogTitle>
          <DialogDescription>
            Replacing v{doc.versionNumber} of "{doc.fileName}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New File *</Label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors border-muted-foreground/20">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <FileText className="w-8 h-8 mb-3 text-primary" />
                      <p className="mb-2 text-sm font-semibold">{file.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm font-medium">Click to select new version</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Revision Note</Label>
            <Textarea 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What changed in this version?" 
              rows={3} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isUploading || !file} className="gap-2">
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              Upload v{doc.versionNumber + 1}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
