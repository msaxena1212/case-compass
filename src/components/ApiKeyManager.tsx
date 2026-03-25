import { securityService } from "@/services/securityService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Key, Copy, Trash2, Plus, Clock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function ApiKeyManager() {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyRole, setNewKeyRole] = useState<ApiKey['role']>("Read-Only");
  const queryClient = useQueryClient();

  const { data: keys = [] } = useQuery({
    queryKey: ['api-keys'],
    queryFn: securityService.getApiKeys
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string, role: string }) => securityService.generateApiKey(data.name, data.role as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setIsCreateOpen(false);
      setNewKeyName("");
      toast.success(`API Key "${newKeyName}" generated successfully.`);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => securityService.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success("API Key access revoked.");
    }
  });

  const handleCreate = () => {
    if (!newKeyName) {
      toast.error("Please enter a name for the API key.");
      return;
    }
    createMutation.mutate({ name: newKeyName, role: newKeyRole });
  };

  const handleRevoke = (id: string) => {
    revokeMutation.mutate(id);
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API Key copied to clipboard.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Key className="h-4 w-4 text-accent" /> Developer API Access
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Generate and manage secure access tokens for third-party integrations.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-8 text-xs">
              <Plus className="h-3.5 w-3.5" /> Generate Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" /> Generate New API Key
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Mobile App, Custom Dashboard" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Permission Role</Label>
                <Select value={newKeyRole} onValueChange={(val: any) => setNewKeyRole(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Read-Only">Read-Only (GET requests only)</SelectItem>
                    <SelectItem value="Write-Only">Write-Only (POST/PATCH only)</SelectItem>
                    <SelectItem value="Admin">Admin (Full Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreate} className="w-full bg-accent font-bold">Generate Access Token</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-bold text-[10px] uppercase tracking-wider">Key Label</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-wider">Access Token</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-wider">Role</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-wider">Last Used</TableHead>
              <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((k) => (
              <TableRow key={k.id} className={`hover:bg-muted/10 transition-colors ${k.status === 'Revoked' ? 'opacity-50' : ''}`}>
                <TableCell className="py-4">
                  <div>
                    <p className="text-xs font-bold">{k.name}</p>
                    <p className="text-[10px] text-muted-foreground">Created: {new Date(k.createdAt).toLocaleDateString()}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] bg-muted/60 px-2 py-1 rounded border font-mono">
                      {showKey === k.id ? k.key : k.key.replace(/./g, '*').substring(0, 15) + '...'}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-accent"
                      onClick={() => setShowKey(showKey === k.id ? null : k.id)}
                    >
                      {showKey === k.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    {k.status === 'Active' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-accent"
                        onClick={() => handleCopy(k.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[9px] font-black uppercase h-5 px-1.5 ${
                    k.role === 'Admin' ? 'bg-red-50 text-red-700 border-red-200' :
                    k.role === 'Write-Only' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {k.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-[10px] font-medium text-muted-foreground">
                  {k.lastUsed ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(k.lastUsed).toLocaleDateString()}
                    </div>
                  ) : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  {k.status === 'Active' ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRevoke(k.id)}
                    >
                      Revoke
                    </Button>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[9px] font-black uppercase">Revoked</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
