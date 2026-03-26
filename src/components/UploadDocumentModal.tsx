import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { documentService } from "@/services/documentService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { caseService } from "@/services/caseService";
import { toast } from "sonner";
import { Upload, FileText, Loader2, Lock } from "lucide-react";

type UploadDocumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  caseId?: string;
  onSuccess?: () => void;
};

export function UploadDocumentModal({ isOpen, onClose, clientId, caseId: initialCaseId, onSuccess }: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('Evidence');
  const [caseId, setCaseId] = useState(initialCaseId || '');
  const [isUploading, setIsUploading] = useState(false);
  const [enablePassword, setEnablePassword] = useState(false);
  const [docPassword, setDocPassword] = useState('');
  const queryClient = useQueryClient();

  // Fetch all cases if caseId is not provided
  const { data: casesResponse } = useQuery({
    queryKey: ['cases'],
    queryFn: () => caseService.getAllCases(1, 1000),
    enabled: isOpen && !initialCaseId
  });
  const cases = casesResponse?.data || [];

  const uploadMutation = useMutation({
    mutationFn: async ({ docData, file }: { docData: any, file: File }) => {
      return documentService.uploadDocument(docData, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success("Document uploaded successfully");
      setFile(null);
      setCaseId(initialCaseId || '');
      setIsUploading(false);
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const targetCaseId = initialCaseId || caseId;
    if (!targetCaseId) {
      toast.error("A related case is required to upload a document.");
      return;
    }

    setIsUploading(true);

    const docData = {
      caseId: targetCaseId,
      fileName: file.name,
      fileType: file.type,
      documentType,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      versionNumber: 1,
      status: 'active',
      uploadedBy: 'Adv. Kumar',
      tags: [],
      versions: [],
      isEncrypted: enablePassword && docPassword.length > 0
    };

    uploadMutation.mutate({ docData, file });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Upload Document
          </DialogTitle>
          <DialogDescription>
            Select a file to add to this client's case records.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors border-muted-foreground/20">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <FileText className="w-8 h-8 mb-3 text-primary" />
                      <p className="mb-2 text-sm font-semibold truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, ZIP (Max 10MB)</p>
                    </>
                  )}
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="case">Related Case *</Label>
            {initialCaseId ? (
              <Input value={initialCaseId} disabled className="bg-muted/50" />
            ) : (
              <select 
                id="case"
                value={caseId}
                onChange={e => setCaseId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a case...</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Document Type *</Label>
            <select 
              id="type"
              value={documentType}
              onChange={e => setDocumentType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Evidence">Evidence</option>
              <option value="Pleading">Pleading</option>
              <option value="Order">Court Order</option>
              <option value="Contract">Contract</option>
              <option value="Misc">Miscellaneous</option>
            </select>
          </div>

          {/* Password Protection */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="enable-password" 
                checked={enablePassword} 
                onChange={e => setEnablePassword(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="enable-password" className="flex items-center gap-2 cursor-pointer">
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                Password Protect this Document
              </Label>
            </div>
            {enablePassword && (
              <Input 
                type="password" 
                placeholder="Enter a password for this document..." 
                value={docPassword} 
                onChange={e => setDocPassword(e.target.value)}
              />
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isUploading || !file} className="gap-2">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
