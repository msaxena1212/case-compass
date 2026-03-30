import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mail, File, IndianRupee, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type BrandPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  firmName: string;
  tagline: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  templateId: string;
};

export function BrandPreviewModal({ 
  isOpen, 
  onClose, 
  firmName, 
  tagline, 
  logo, 
  primaryColor, 
  secondaryColor,
  templateId 
}: BrandPreviewModalProps) {
  
  const initials = firmName.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Branding Live Preview
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-[10px] uppercase font-bold">
                <Printer className="h-3 w-3" /> Print Trace
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-[10px] uppercase font-bold">
                <Download className="h-3 w-3" /> Export Mock
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="invoice" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 border-b">
            <TabsList className="bg-transparent h-12 w-full justify-start gap-8 p-0">
              <TabsTrigger value="invoice" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full bg-transparent px-0 text-xs font-bold gap-2">
                <FileText className="h-4 w-4" /> Invoice Preview
              </TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full bg-transparent px-0 text-xs font-bold gap-2">
                <Mail className="h-4 w-4" /> Email Notification
              </TabsTrigger>
              <TabsTrigger value="document" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full bg-transparent px-0 text-xs font-bold gap-2">
                <File className="h-4 w-4" /> Legal Document
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
            {/* Invoice Preview */}
            <TabsContent value="invoice" className="m-0">
              <div className={`bg-white shadow-2xl rounded-sm mx-auto max-w-[600px] min-h-[700px] flex flex-col ${templateId === 'premium' ? 'border-t-[12px]' : ''}`} style={{ borderTopColor: templateId === 'premium' ? secondaryColor : undefined }}>
                {/* Invoice Header */}
                <div className="p-8 flex justify-between items-start">
                  <div className="space-y-4">
                    {logo ? (
                      <img src={logo} alt="Firm Logo" className="h-16 w-auto object-contain" />
                    ) : (
                      <div className="h-16 w-16 rounded flex items-center justify-center text-white text-2xl font-black" style={{ background: primaryColor }}>
                        {initials}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-black tracking-tight" style={{ color: primaryColor }}>{firmName}</h2>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{tagline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-black uppercase tracking-tighter opacity-10 mb-2">Invoice</h1>
                    <p className="text-xs font-bold">INV-2026-0421</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Date: March 30, 2026</p>
                  </div>
                </div>

                {/* Invoice Body */}
                <div className="px-8 flex-1">
                  <div className="grid grid-cols-2 gap-8 py-8 border-y border-dashed">
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Billed To</p>
                      <p className="text-sm font-bold">Reliance Industries Ltd.</p>
                      <p className="text-xs text-muted-foreground">Maker Chambers IV, Nariman Point</p>
                      <p className="text-xs text-muted-foreground">Mumbai, Maharashtra 400021</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Payment Due</p>
                      <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase" style={{ background: primaryColor + '15', color: primaryColor }}>
                        Due in 15 Days
                      </div>
                    </div>
                  </div>

                  <table className="w-full mt-8">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: primaryColor }}>
                        <th className="py-3 text-left text-[10px] font-black uppercase">Description</th>
                        <th className="py-3 text-center text-[10px] font-black uppercase w-20">Hours</th>
                        <th className="py-3 text-right text-[10px] font-black uppercase w-24">Rate</th>
                        <th className="py-3 text-right text-[10px] font-black uppercase w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y">
                      <tr>
                        <td className="py-4">
                          <p className="font-bold">Supreme Court Representation</p>
                          <p className="text-[10px] text-muted-foreground">Special Leave Petition - SLP(C) No. 1234/2026</p>
                        </td>
                        <td className="py-4 text-center font-mono">4.5</td>
                        <td className="py-4 text-right font-mono">₹15,000</td>
                        <td className="py-4 text-right font-bold">₹67,500</td>
                      </tr>
                      <tr>
                        <td className="py-4">
                          <p className="font-bold">Contract Compliance Review</p>
                          <p className="text-[10px] text-muted-foreground">Master Service Agreement - Vendor Audit</p>
                        </td>
                        <td className="py-4 text-center font-mono">2.0</td>
                        <td className="py-4 text-right font-mono">₹8,000</td>
                        <td className="py-4 text-right font-bold">₹16,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="p-8 bg-muted/10">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex justify-between w-48 text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-mono">₹83,500</span>
                    </div>
                    <div className="flex justify-between w-48 text-sm">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span className="font-mono">₹15,030</span>
                    </div>
                    <div className="flex justify-between w-48 pt-4 border-t mt-2" style={{ borderColor: primaryColor }}>
                      <span className="text-base font-black">Total Due</span>
                      <span className="text-base font-black" style={{ color: primaryColor }}>₹98,530</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-8 text-[10px] text-muted-foreground border-t">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="font-black uppercase tracking-wider" style={{ color: primaryColor }}>Terms & Conditions</p>
                      <p>Payment is due within 15 days of invoice date.</p>
                      <p>Subject to jurisdiction of Delhi High Court.</p>
                    </div>
                    <div className="flex gap-4">
                      {logo ? (
                        <img src={logo} alt="Logo Small" className="h-6 w-auto grayscale opacity-50" />
                      ) : (
                        <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold">
                          {initials}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Email Preview */}
            <TabsContent value="email" className="m-0">
              <div className="bg-gray-100 p-8 rounded-sm mx-auto max-w-[600px] border border-gray-200">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
                  <div className="p-6 text-white flex items-center justify-between" style={{ background: primaryColor }}>
                    {logo ? (
                      <img src={logo} alt="Logo" className="h-8 w-auto brightness-0 invert" />
                    ) : (
                      <span className="font-bold text-lg">{firmName}</span>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Notification</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800">New Legal Document Shared</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Dear Mr. Ambani,<br/><br/>
                      A new memorandum regarding the **Arbitration Proceeding (Sector 24)** has been uploaded to your secure portal for review. 
                      Please access the document using the link below.
                    </p>
                    <div className="py-4">
                      <button className="px-6 py-3 rounded-lg text-white font-bold text-sm shadow-lg transition-transform hover:scale-[1.02]" style={{ background: secondaryColor }}>
                        View Document Securely
                      </button>
                    </div>
                    <div className="pt-6 border-t space-y-2 text-xs text-muted-foreground">
                      <p>Case Reference: **REI-2026-XQ**</p>
                      <p>Assigned Lawyer: **Adv. Priya Sharma**</p>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 text-center space-y-4">
                    <p className="text-[10px] text-slate-400">
                      You are receiving this automated alert because you are an authorized representative of the client.
                      Confidentiality Notice applies.
                    </p>
                    <div className="flex justify-center gap-6 grayscale opacity-60">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Document Preview */}
            <TabsContent value="document" className="m-0">
               <div className="bg-white shadow-2xl rounded-sm mx-auto max-w-[600px] min-h-[750px] p-12 relative flex flex-col">
                  {/* Letterhead */}
                  <div className="flex justify-between items-start border-b-2 pb-8 mb-12" style={{ borderColor: secondaryColor }}>
                    <div>
                       {logo ? (
                          <img src={logo} alt="Logo" className="h-12 w-auto mb-2" />
                        ) : (
                          <div className="h-12 w-12 rounded bg-slate-800 mb-2 flex items-center justify-center text-white font-black text-xl">
                            {initials}
                          </div>
                       )}
                       <h1 className="text-lg font-black tracking-tight" style={{ color: primaryColor }}>{firmName}</h1>
                       <p className="text-[8px] uppercase font-bold tracking-[0.2em] text-muted-foreground">{tagline}</p>
                    </div>
                    <div className="text-right text-[8px] space-y-1 font-medium text-muted-foreground">
                       <p>Supreme Court Enclave, No. 14</p>
                       <p>New Delhi, 110001</p>
                       <p>+91 (11) 2338-XXXX</p>
                       <p className="font-bold underline" style={{ color: primaryColor }}>www.casecompass.ai/firm/{firmName.toLowerCase().replace(/\s/g, '-')}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-6">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span>REF: CC/LIT/2026/991</span>
                       <span>Date: 30 March 2026</span>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold uppercase text-muted-foreground">To,</p>
                       <p className="text-xs font-bold text-slate-800">The Honorable Presiding Judge</p>
                       <p className="text-xs text-slate-800">Commercial Division, Delhi High Court</p>
                    </div>

                    <div className="py-4">
                       <h2 className="text-sm font-black underline text-center uppercase tracking-tight" style={{ color: primaryColor }}>
                          Subject: Urgent Application for Interim Relief under Section 9 of the BC Act
                       </h2>
                    </div>

                    <div className="text-xs space-y-4 text-slate-700 leading-relaxed text-justify">
                       <p>Respected Sir/Madam,</p>
                       <p>
                          Under the instructions from our client, we hereby present this urgent application. The petitioner seeks an immediate stay on the invocation of bank guarantees as detailed in the attached schedule...
                       </p>
                       <p>
                          The circumstances surrounding the case necessitate immediate judicial intervention to prevent irreparable loss to our client's commercial standing and fiscal interests.
                       </p>
                       <div className="h-32 w-full bg-slate-50 border border-dashed rounded flex items-center justify-center text-[10px] italic text-slate-400">
                          [Detailed Legal Grounds and Citations Placeholder]
                       </div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="pt-20">
                     <p className="text-xs font-bold">For {firmName},</p>
                     <div className="h-16 w-32 border-b border-slate-300 my-2" />
                     <p className="text-xs font-black" style={{ color: primaryColor }}>Authorized Signatory</p>
                     <p className="text-[9px] text-muted-foreground mt-1">Digital Identity Verified via LegalDesk PKI Infrastructure</p>
                  </div>
               </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
