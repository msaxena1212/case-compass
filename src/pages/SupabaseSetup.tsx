import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Database, CheckCircle, AlertCircle, Brain, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

export default function SupabaseSetup() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const testConnection = async () => {
    setTesting(true);
    try {
      // Just a simple query to check if we can talk to Supabase
      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) throw error;
      setConnectionStatus('success');
      toast.success("Supabase connection verified!");
    } catch (error: any) {
      setConnectionStatus('error');
      console.error("Connection test failed:", error);
      toast.error(`Connection failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const createAdmin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@casecompass.com',
        password: 'V3n92nCsQzOINM0h',
        options: {
          data: {
            name: 'System Admin',
            role: 'Admin'
          }
        }
      });

      if (error && !error.message.includes("already registered")) throw error;
      
      // Try to get user ID if signUp didn't return it (already registered)
      let userId = data.user?.id;
      if (!userId && error?.message.includes("already registered")) {
        // We can't easily get the ID of an existing user via Anon key for security
        // But we can inform the user.
        toast.info("User already exists in Auth. Ensuring profile is present...");
      }

      // Also create the profile record (Upsert to be safe)
      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: userId,
            name: 'System Admin',
            email: 'admin@casecompass.com',
            role: 'Admin',
            status: 'Active'
          }]);
        
        if (profileError) console.error("Profile sync failed:", profileError);
      }

      setSuccess(true);
      toast.success("Admin user created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-accent/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-display font-bold">Supabase Setup</CardTitle>
            <CardDescription>
              One-time setup to initialize your Legal OS environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className={`h-5 w-5 mt-0.5 ${success ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-bold">Create Admin Account</p>
                  <p className="text-xs text-muted-foreground">Creates admin@casecompass.com with your master password.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-bold">Mock Data Ready</p>
                  <p className="text-xs text-muted-foreground">Run supabase/seed.sql in your Supabase SQL Editor.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                variant="outline"
                onClick={testConnection}
                disabled={testing}
                className={`w-full h-10 font-bold gap-2 ${connectionStatus === 'success' ? 'border-emerald-500 text-emerald-600' : ''}`}
              >
                {testing ? "Testing..." : connectionStatus === 'success' ? "Connection Verified" : "Test Supabase Connection"}
              </Button>

              {success ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3 text-emerald-800">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm font-bold">Admin account is ready for login!</p>
                </div>
              ) : (
                <Button 
                  onClick={createAdmin} 
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold gap-2"
                  disabled={loading || connectionStatus !== 'success'}
                >
                  {loading ? "Creating Account..." : "Initialize Admin User"}
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-xs font-bold uppercase tracking-tight">Required: Auth Configuration</p>
              </div>
              <p className="text-[11px] leading-relaxed font-medium">
                Supabase requires email confirmation by default. To login with a password immediately, you <strong>MUST</strong>:
              </p>
              <ol className="text-[11px] list-decimal list-inside space-y-1 font-medium ml-1">
                <li>Go to <a href="https://supabase.com/dashboard/project/jepigwsdhxsmvwpaqryg/auth/settings" target="_blank" rel="noreferrer" className="underline font-bold">Auth Settings</a></li>
                <li>Scroll to <strong>"Confirm Email"</strong> and toggle it <strong>OFF</strong></li>
                <li>Save Changes</li>
              </ol>
            </div>

            <div className="flex flex-col gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-xs font-bold uppercase tracking-tight">Required: Storage Initialization</p>
              </div>
              <p className="text-[11px] leading-relaxed font-medium">
                The document cloud requires a storage bucket named <strong>'documents'</strong>. Run this SQL in your <a href="https://supabase.com/dashboard/project/jepigwsdhxsmvwpaqryg/sql/new" target="_blank" rel="noreferrer" className="underline font-bold">SQL Editor</a>:
              </p>
              <pre className="text-[9px] bg-slate-900 text-slate-100 p-2 rounded overflow-x-auto font-mono">
{`-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- 2. Add missing columns to documents table
alter table public.documents 
add column if not exists is_encrypted boolean default false,
add column if not exists signature_status text default 'Not Required',
add column if not exists signed_at timestamptz,
add column if not exists signed_by text,
add column if not exists versions jsonb default '[]';

-- 3. Enable public access
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'documents' );

-- 4. Enable uploads for authenticated users
create policy "Authenticated Uploads"
  on storage.objects for insert
  with check ( 
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated' 
  );`}
              </pre>

              {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full text-[10px] font-bold border-dashed hover:bg-white"
                  onClick={() => {
                    const active = localStorage.getItem('legaldesk_bypass_storage') === 'true';
                    localStorage.setItem('legaldesk_bypass_storage', (!active).toString());
                    toast.success(`Storage bypass ${!active ? 'enabled' : 'disabled'}`);
                    window.location.reload();
                  }}
                >
                  <Database className="h-3 w-3 mr-2 text-blue-500" />
                  {localStorage.getItem('legaldesk_bypass_storage') === 'true' 
                    ? "Disable Storage Bypass" 
                    : "Enable Storage Bypass (Dev Mode)"}
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg text-purple-800">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-xs font-bold uppercase tracking-tight">AI: Ollama Configuration</p>
              </div>
              <p className="text-[11px] leading-relaxed font-medium">
                AI analysis requires a local <strong>Ollama</strong> instance. 
              </p>
              <ol className="text-[11px] list-decimal list-inside space-y-1 font-medium ml-1">
                <li>Install Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer" className="underline font-bold">ollama.com</a></li>
                <li>Run: <code className="bg-purple-100 px-1 rounded">ollama run glm-5:cloud</code></li>
              </ol>
              
              <div className="flex flex-col gap-2 mt-1">
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full text-[10px] font-bold h-8"
                  onClick={async () => {
                    try {
                      const res = await fetch('http://localhost:11434/api/tags');
                      if (res.ok) toast.success("Ollama is running!");
                      else toast.error("Ollama returned an error status");
                    } catch (e) {
                      toast.error("Ollama is not reachable. Is it running?");
                    }
                  }}
                >
                  Test Ollama Connection
                </Button>

                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full text-[10px] font-bold border-dashed border-purple-400 h-8"
                  onClick={() => {
                    const active = localStorage.getItem('legaldesk_bypass_ai') === 'true';
                    localStorage.setItem('legaldesk_bypass_ai', (!active).toString());
                    toast.success(`AI bypass ${!active ? 'enabled' : 'disabled'}`);
                    window.location.reload();
                  }}
                >
                  <Sparkles className="h-3 w-3 mr-2 text-purple-500" />
                  {localStorage.getItem('legaldesk_bypass_ai') === 'true' 
                    ? "Disable AI Bypass" 
                    : "Enable AI Bypass (Dev Mode)"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
