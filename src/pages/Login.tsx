import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Shield, Lock, Mail, ChevronRight, Scale, Loader2, Database } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      console.log("Login: Session detected, navigating to dashboard...");
      navigate("/", { replace: true });
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.status === 400 || error.message.includes("Email not confirmed")) {
          toast.error(
            <div className="flex flex-col gap-2">
              <p>Login failed. Email confirmation required.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-[10px] font-bold"
                onClick={() => navigate("/setup")}
              >
                Go to Setup Instructions
              </Button>
            </div>,
            { duration: 6000 }
          );
        } else {
          throw error;
        }
        return;
      }

      if (data.session) {
        toast.success("Welcome back to LegalDesk");
        navigate("/", { replace: true });
      } else {
        toast.info("Account created, but requires confirmation. Please check your Supabase dashboard.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  if (session) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-accent animate-spin" />
          <p className="text-sm font-bold text-slate-600">Checking credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center text-center space-y-2 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20 mb-2">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900">LegalDesk</h1>
          <p className="text-sm text-muted-foreground">The Enterprise Legal Operating System</p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-slate-200/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">In-House Login</CardTitle>
            <CardDescription className="text-xs">Access your firm's cases and intelligent legal tools.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@firm.com" 
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                  <Button variant="link" className="px-0 h-auto text-[10px] text-accent font-bold">Forgot password?</Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button type="submit" className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold gap-2" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Sign In to Workspace"}
                {!isLoading && <ChevronRight className="h-4 w-4" />}
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  <span className="bg-white px-2">Standard Access</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <Button variant="outline" type="button" className="h-10 text-xs font-bold gap-2 bg-white">
                  <Shield className="h-3.5 w-3.5 text-blue-600" /> SSO
                </Button>
                <Button variant="outline" type="button" className="h-10 text-xs font-bold gap-2 bg-white">
                  <Lock className="h-3.5 w-3.5 text-orange-500" /> OTP
                </Button>
              </div>

              {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full h-9 text-[10px] font-bold text-muted-foreground border border-dashed border-muted-foreground/30 hover:bg-slate-100"
                  onClick={() => {
                    localStorage.setItem('legaldesk_bypass_auth', 'true');
                    window.location.reload();
                  }}
                >
                  <Database className="h-3 w-3 mr-2 text-indigo-500" />
                  Bypass Auth (Development Only)
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground font-medium leading-relaxed">
          Authorized personnel only. All access attempts are logged per LegalDesk security policy (GDPR & ISO27001).
        </p>
      </div>
    </div>
  );
}
