import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState<string>("Verifying your email...");

  const urlInfo = useMemo(() => {
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const error = params.get("error");
    const error_description = params.get("error_description");
    return { error, error_description };
  }, []);

  useEffect(() => {
    document.title = "Email Verification • MoodBloom";

    // If Supabase returned an error in the URL hash
    if (urlInfo.error || urlInfo.error_description) {
      setStatus("error");
      setMessage(urlInfo.error_description || "Email link is invalid or has expired.");
      toast({
        title: "Verification failed",
        description: urlInfo.error_description || "Email link is invalid or has expired.",
        variant: "destructive",
      });
      return;
    }

    // Auth client will parse tokens from URL automatically (detectSessionInUrl: true)
    // We listen for the sign-in event and then redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("success");
        setMessage("You're all set! Redirecting...");
        toast({ title: "Email verified", description: "Welcome to MoodBloom" });
        setTimeout(() => navigate("/", { replace: true }), 1200);
      }
    });

    // Fallback in case the event fires before listener or tokens already parsed
    setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus("success");
        setMessage("You're all set! Redirecting...");
        setTimeout(() => navigate("/", { replace: true }), 800);
      } else {
        // If after a moment we still don't have a session, show helpful error
        setStatus("error");
        setMessage("We couldn't verify your session automatically. Please try the link again or request a new email.");
      }
    }, 500);

    return () => subscription.unsubscribe();
  }, [navigate, toast, urlInfo.error, urlInfo.error_description]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Confirming your email</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="pt-2">
          {status === "success" ? (
            <Button onClick={() => navigate("/", { replace: true })}>Continue</Button>
          ) : status === "error" ? (
            <div className="space-y-2">
              <Button variant="secondary" onClick={() => navigate("/auth", { replace: true })}>
                Go to Sign In
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Please wait...</div>
          )}
        </div>
        <p className="sr-only">Email verification status for MoodBloom authentication</p>
      </Card>
    </main>
  );
};

export default AuthCallback;
