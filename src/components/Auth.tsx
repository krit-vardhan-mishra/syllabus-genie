import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";

interface AuthProps {
  onAuthenticated: () => void;
}

const Auth = ({ onAuthenticated }: AuthProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "You can now start analyzing your syllabus.",
        });
        onAuthenticated();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        onAuthenticated();
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-warm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Syllabus Analyzer</h1>
          <p className="text-muted-foreground">
            {isSignUp ? "Create an account to get started" : "Sign in to continue"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Auth;