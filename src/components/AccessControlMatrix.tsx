import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Lock, Eye, Edit3, Trash2, Download } from "lucide-react";
import { UserRole } from "@/types/security";
import { securityService } from "@/services/securityService";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

const ROLES: UserRole[] = ['Partner', 'Lawyer', 'Junior Associate', 'Admin', 'Client'];
const MODULES = ['Cases', 'Documents', 'Billing', 'AI Assistant', 'System', 'Contracts'];

export function AccessControlMatrix() {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<string | null>(null);

  const { data: permissions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: securityService.getRolePermissions,
    retry: 1
  });

  const mutation = useMutation({
    mutationFn: ({ role, module, actions }: { role: string, module: string, actions: string[] }) => 
      securityService.updateRolePermission(role, module, actions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success("Permission updated");
      setUpdating(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to update: ${error.message}`);
      setUpdating(null);
    }
  });

  const togglePermission = (role: string, module: string, action: string) => {
    const dbModule = module === 'AI Assistant' ? 'AI' : module;
    const rule = permissions.find((r: any) => r.role === role && r.module === dbModule);
    let currentActions = rule?.actions || [];
    
    let newActions;
    if (currentActions.includes(action)) {
      newActions = currentActions.filter((a: string) => a !== action);
    } else {
      newActions = [...currentActions, action];
    }

    setUpdating(`${role}-${module}-${action}`);
    mutation.mutate({ role, module: dbModule, actions: newActions });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="h-10 w-10 text-accent animate-spin" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Loading Permissions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-red-600">Failed to load permissions</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">The system encountered an error while fetching the RBAC matrix. This might be due to a missing table or network issue.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          Retry Connection
        </Button>
      </div>
    );
  }

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
                  const dbModule = module === 'AI Assistant' ? 'AI' : module;
                  const rule = permissions.find((r: any) => r.role === role && r.module === dbModule);
                  
                  const canView = rule?.actions.includes('View') || (role === 'Admin');
                  const canEdit = rule?.actions.includes('Edit') || (role === 'Admin' && module !== 'AI Assistant');
                  const canDelete = rule?.actions.includes('Delete') || (role === 'Admin' && module === 'System');
                  const canExport = rule?.actions.includes('Export') || (role === 'Partner');

                  return (
                    <TableCell key={`${role}-${module}`} className="text-center border-l py-4 px-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <PermissionToggle 
                          active={canView} 
                          loading={updating === `${role}-${module}-View`}
                          onClick={() => togglePermission(role, module, 'View')}
                          color="emerald"
                          icon={<Eye className="h-2.5 w-2.5" />}
                        />
                        <PermissionToggle 
                          active={canEdit} 
                          loading={updating === `${role}-${module}-Edit`}
                          onClick={() => togglePermission(role, module, 'Edit')}
                          color="emerald"
                          icon={<Edit3 className="h-2.5 w-2.5" />}
                        />
                        <PermissionToggle 
                          active={canDelete} 
                          loading={updating === `${role}-${module}-Delete`}
                          onClick={() => togglePermission(role, module, 'Delete')}
                          color="red"
                          icon={<Trash2 className="h-2.5 w-2.5" />}
                        />
                        <PermissionToggle 
                          active={canExport} 
                          loading={updating === `${role}-${module}-Export`}
                          onClick={() => togglePermission(role, module, 'Export')}
                          color="blue"
                          icon={<Download className="h-2.5 w-2.5" />}
                        />
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
            LegalDesk uses **Zero Trust Architecture**. Default access is always denied until explicitly granted via these roles. This ensures multi-office compliance and data privacy for high-profile clients.
          </p>
        </div>
      </div>
    </div>
  );
}

function PermissionToggle({ active, loading, onClick, color, icon }: any) {
  if (loading) {
    return (
      <div className="h-4 w-4 flex items-center justify-center">
        <Loader2 className="h-2.5 w-2.5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const activeClasses = color === 'red' 
    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
    : color === 'blue'
    ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
    : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100';

  return (
    <button 
      onClick={onClick}
      className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
        active 
          ? activeClasses 
          : 'bg-muted/40 border-border/40 text-muted-foreground/30 hover:bg-muted/60'
      }`}
    >
      {active ? icon : <X className="h-2.5 w-2.5" />}
    </button>
  );
}
