import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Palette, Upload, Eye, Save, CheckCircle2, 
  FileText, Mail, Loader2, Building2
} from "lucide-react";

const invoiceTemplates = [
  { id: 'classic', name: 'Classic', description: 'Traditional formal layout', preview: 'border-2 border-gray-300 bg-white' },
  { id: 'modern', name: 'Modern', description: 'Clean minimal design', preview: 'border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white' },
  { id: 'premium', name: 'Premium', description: 'Gold accents & letterhead', preview: 'border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white' },
];

const emailTemplates = [
  { id: 'invoice-reminder', name: 'Invoice Reminder', subject: 'Payment Due: Invoice #{number}' },
  { id: 'hearing-notice', name: 'Hearing Notice', subject: 'Upcoming Hearing: {case_title}' },
  { id: 'welcome-client', name: 'Welcome Client', subject: 'Welcome to {firm_name}' },
  { id: 'case-update', name: 'Case Status Update', subject: 'Update on {case_title}' },
];

export default function BrandSettings() {
  const [firmName, setFirmName] = useState('LegalDesk & Associates');
  const [primaryColor, setPrimaryColor] = useState('#1e3a5f');
  const [secondaryColor, setSecondaryColor] = useState('#c8a45a');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedInvoiceTemplate, setSelectedInvoiceTemplate] = useState('modern');
  const [isSaving, setIsSaving] = useState(false);
  const [tagline, setTagline] = useState('Justice Through Excellence');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 1200));
    setIsSaving(false);
    toast.success("Brand settings saved successfully!");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">Brand & Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">Customize your firm's identity across all documents and communications.</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 shrink-0">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Firm Identity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Firm Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Firm Name</Label>
                  <Input value={firmName} onChange={e => setFirmName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input value={tagline} onChange={e => setTagline(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-14 rounded border cursor-pointer" />
                    <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary / Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="h-10 w-14 rounded border cursor-pointer" />
                    <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="font-mono" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Firm Logo</Label>
                <div className="flex items-center gap-4">
                  <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-2 rounded-xl" />
                    ) : (
                      <div className="flex flex-col items-center text-center p-2">
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground">Upload Logo</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Recommended: 200x200px PNG with transparent background</p>
                    <p className="text-xs">This logo will be used on invoices, documents, and email headers.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-10 w-10 rounded object-contain" />
                  ) : (
                    <div className="h-10 w-10 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: primaryColor }}>
                      {firmName.split(' ').map(w => w[0]).join('').slice(0,2)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold" style={{ color: primaryColor }}>{firmName}</p>
                    <p className="text-[10px] text-muted-foreground italic">{tagline}</p>
                  </div>
                </div>
                <div className="text-[10px] space-y-2">
                  <div className="h-2 rounded-full" style={{ background: primaryColor, width: '80%' }} />
                  <div className="h-2 rounded-full bg-muted" style={{ width: '60%' }} />
                  <div className="h-2 rounded-full" style={{ background: secondaryColor, width: '40%' }} />
                </div>
                <div className="text-center pt-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest" style={{ color: secondaryColor }}>Invoice Sample</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Invoice Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {invoiceTemplates.map(tmpl => (
                <div 
                  key={tmpl.id} 
                  className={`rounded-xl p-4 cursor-pointer transition-all ${tmpl.preview} ${selectedInvoiceTemplate === tmpl.id ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
                  onClick={() => setSelectedInvoiceTemplate(tmpl.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold">{tmpl.name}</h4>
                    {selectedInvoiceTemplate === tmpl.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="h-1.5 rounded-full bg-gray-200" style={{ width: '70%' }} />
                    <div className="h-1.5 rounded-full bg-gray-200" style={{ width: '50%' }} />
                    <div className="h-1.5 rounded-full bg-gray-200" style={{ width: '30%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Email Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {emailTemplates.map(tmpl => (
                <div key={tmpl.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{tmpl.name}</h4>
                    <Badge variant="secondary" className="text-[9px]">Editable</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                    Subject: {tmpl.subject}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
