import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Lock, Eye, Edit3, Trash2, Download } from "lucide-react";
import { mockAccessControl } from "@/store/mockData";
import { UserRole } from "@/types/security";

const ROLES: UserRole[] = ['Partner', 'Lawyer', 'Junior Associate', 'Admin', 'Client'];
const MODULES = ['Cases', 'Documents', 'Billing', 'AI Assistant', 'System', 'Contracts'];

export function AccessControlMatrix() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Lock className="h-4 w-4 text-accent" /> Role-Based Access Control (RBAC)
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Define granular permissions for each user role across system modules.</p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> View</span>
          <span className="flex items-center gap-1"><Edit3 className="h-3 w-3" /> Edit</span>
          <span className="flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</span>
          <span className="flex items-center gap-1"><Download className="h-3 w-3" /> Export</span>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-bold text-[10px] uppercase tracking-wider">Module</TableHead>
              {ROLES.map(role => (
                <TableHead key={role} className="text-center font-bold text-[10px] uppercase tracking-wider border-l">
                  {role}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {MODULES.map(module => (
              <TableRow key={module} className="hover:bg-muted/10 transition-colors">
                <TableCell className="font-bold text-xs py-4">{module}</TableCell>
                {ROLES.map(role => {
                  const rule = mockAccessControl.find(r => r.role === role && r.module === (module === 'AI Assistant' ? 'AI' : module === 'System' ? 'System' : module)); // Adjusted for mock naming
                  // Default logic for demo purposes if rule not found exactly
                  const canView = rule?.actions.includes('View') || (role === 'Admin');
                  const canEdit = rule?.actions.includes('Edit') || (role === 'Admin' && module !== 'AI Assistant');
                  const canDelete = rule?.actions.includes('Delete') || (role === 'Admin' && module === 'System');
                  const canExport = rule?.actions.includes('Export') || (role === 'Partner');

                  return (
                    <TableCell key={`${role}-${module}`} className="text-center border-l py-4 px-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`h-4 w-4 rounded flex items-center justify-center border ${canView ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-muted/40 border-border/40 text-muted-foreground/30'}`}>
                          {canView ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                        </span>
                        <span className={`h-4 w-4 rounded flex items-center justify-center border ${canEdit ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-muted/40 border-border/40 text-muted-foreground/30'}`}>
                          {canEdit ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                        </span>
                        <span className={`h-4 w-4 rounded flex items-center justify-center border ${canDelete ? 'bg-red-50 border-red-200 text-red-600' : 'bg-muted/40 border-border/40 text-muted-foreground/30'}`}>
                          {canDelete ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                        </span>
                        <span className={`h-4 w-4 rounded flex items-center justify-center border ${canExport ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-muted/40 border-border/40 text-muted-foreground/30'}`}>
                          {canExport ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                        </span>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl flex items-start gap-3">
        <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-accent">Strategic Tip</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Case Compass uses **Zero Trust Architecture**. Default access is always denied until explicitly granted via these roles. This ensures multi-office compliance and data privacy for high-profile clients.
          </p>
        </div>
      </div>
    </div>
  );
}
