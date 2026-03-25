import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Database, CheckCircle, AlertCircle } from "lucide-react";
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
                <p className="text-xs font-bold uppercase tracking-tight">Required Configuration</p>
              </div>
              <p className="text-[11px] leading-relaxed font-medium">
                Supabase requires email confirmation by default. To login with a password immediately, you <strong>MUST</strong>:
              </p>
              <ol className="text-[11px] list-decimal list-inside space-y-1 font-medium ml-1">
                <li>Go to <a href="https://supabase.com/dashboard/project/jepigwsdhxsmvwpaqryg/auth/settings" target="_blank" rel="noreferrer" className="underline font-bold">Auth Settings</a></li>
                <li>Scroll to <strong>"Confirm Email"</strong></li>
                <li>Toggle it <strong>OFF</strong></li>
                <li>Save Changes</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
