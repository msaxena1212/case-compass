import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useCallback, useRef } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle2, Loader2, Sparkles, X } from "lucide-react";
import { mockCases, mockDocuments, generateId, checkDocumentDuplicate } from "@/store/mockData";
import { LegalDocument, DocumentType } from "@/types/document";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

type UploadDocumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultCaseId?: string;
};

type ProcessingStep = 'idle' | 'uploading' | 'ocr' | 'indexing' | 'ai-summary' | 'complete';

const processingSteps: { key: ProcessingStep; label: string; progress: number }[] = [
  { key: 'uploading', label: 'Uploading file...', progress: 15 },
  { key: 'ocr', label: 'Running OCR extraction...', progress: 40 },
  { key: 'indexing', label: 'Indexing & tagging...', progress: 65 },
  { key: 'ai-summary', label: 'Generating AI summary...', progress: 85 },
  { key: 'complete', label: 'Processing complete!', progress: 100 },
];

const documentTypes: DocumentType[] = ['Petition', 'Contract', 'Evidence', 'Order', 'Affidavit', 'Notice', 'Agreement'];

export function UploadDocumentModal({ isOpen, onClose, defaultCaseId }: UploadDocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caseId, setCaseId] = useState(defaultCaseId || '');
  const [docType, setDocType] = useState<DocumentType | ''>('');
  const [tags, setTags] = useState('');
  const [versionNote, setVersionNote] = useState('');
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|jpg|jpeg|png)$/i)) {
      toast.error('Unsupported format. Only PDF, DOCX, and Images allowed.');
      return;
    }
    if (file.size > maxSize) {
      toast.error('File too large. Maximum 50MB allowed.');
      return;
    }

    // Simulate duplicate check
    const fakeHash = file.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
    const dup = checkDocumentDuplicate(fakeHash);
    if (dup) {
      setDuplicateWarning(true);
    }

    setSelectedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const simulateProcessing = async () => {
    for (const step of processingSteps) {
      setProcessingStep(step.key);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !caseId || !docType) {
      toast.error('Please fill all required fields.');
      return;
    }

    await simulateProcessing();

    const caseName = mockCases.find(c => c.id === caseId)?.title || caseId;
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'pdf';
    const fileType = fileExt === 'pdf' ? 'pdf' : fileExt === 'docx' ? 'docx' : 'image';

    const newDoc: LegalDocument = {
      id: generateId('doc'),
      caseId,
      caseName,
      fileName: selectedFile.name,
      fileUrl: `/docs/${selectedFile.name}`,
      fileType: fileType as LegalDocument['fileType'],
      documentType: docType,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      versionNumber: 1,
      versions: [
        { version: 1, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), uploadedBy: 'Adv. Kumar', note: versionNote || 'Initial upload' },
      ],
      uploadedBy: 'Adv. Kumar',
      uploadedAt: new Date().toISOString(),
      size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'active',
      aiSummary: 'AI processing complete. Document has been indexed and is now fully searchable.',
      aiKeywords: tags.split(',').map(t => t.trim()).filter(Boolean),
      riskClauses: [],
      hash: generateId('hash'),
    };

    mockDocuments.push(newDoc);
    toast.success('Document uploaded & AI-processed successfully!');

    // Reset
    setSelectedFile(null);
    setCaseId(defaultCaseId || '');
    setDocType('');
    setTags('');
    setVersionNote('');
    setProcessingStep('idle');
    setDuplicateWarning(false);
    onClose();
  };

  const currentProgress = processingSteps.find(s => s.key === processingStep)?.progress || 0;
  const isProcessing = processingStep !== 'idle' && processingStep !== 'complete';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Upload Document
          </DialogTitle>
          <DialogDescription>
            Upload a legal document. AI will automatically extract text, generate a summary, and detect risk clauses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Duplicate Warning */}
          {duplicateWarning && (
            <Alert variant="destructive" className="bg-amber-50 text-amber-900 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Possible Duplicate</AlertTitle>
              <AlertDescription className="text-amber-700">
                A similar document already exists. Proceeding will create a new entry.
              </AlertDescription>
            </Alert>
          )}

          {/* Drop Zone */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <Upload className={`h-10 w-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-semibold">Drop files here or click to browse</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">PDF, DOCX, Images · Max 50MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => { setSelectedFile(null); setDuplicateWarning(false); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Processing Animation */}
          {processingStep !== 'idle' && (
            <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                {processingStep === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                )}
                <span className="text-sm font-semibold text-purple-800">
                  {processingSteps.find(s => s.key === processingStep)?.label}
                </span>
                <Sparkles className="h-3.5 w-3.5 text-purple-500 ml-auto" />
              </div>
              <Progress value={currentProgress} className="h-2" />
              <div className="grid grid-cols-4 gap-1">
                {processingSteps.slice(0, 4).map((step, i) => {
                  const stepIndex = processingSteps.findIndex(s => s.key === processingStep);
                  const isDone = stepIndex > i;
                  const isCurrent = stepIndex === i;
                  return (
                    <div key={step.key} className="text-center">
                      <div className={`text-[8px] uppercase font-bold tracking-widest ${isDone ? 'text-green-600' : isCurrent ? 'text-purple-700' : 'text-muted-foreground'}`}>
                        {step.key === 'uploading' ? 'Upload' : step.key === 'ocr' ? 'OCR' : step.key === 'indexing' ? 'Index' : 'AI'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Fields */}
          {processingStep === 'idle' && (
            <>
              <div className="space-y-2">
                <Label>Link to Case *</Label>
                <Select value={caseId} onValueChange={setCaseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select case..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCases.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.caseNumber || c.id} · {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. petition, IP, high-court (comma separated)" />
              </div>

              <div className="space-y-2">
                <Label>Version Note</Label>
                <Input value={versionNote} onChange={e => setVersionNote(e.target.value)} placeholder="e.g. Initial draft, Revised petition..." />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || !caseId || !docType || isProcessing}
            className="gap-2"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isProcessing ? 'Processing...' : 'Upload & Process'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
