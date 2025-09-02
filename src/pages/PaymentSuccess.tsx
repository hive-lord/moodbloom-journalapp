import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setIsVerifying(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      if (data?.success) {
        setVerificationComplete(true);
        toast({
          title: "Payment Successful!",
          description: "You now have unlimited journal entries!",
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "Please contact support if issues persist.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-calm flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {isVerifying ? (
          <>
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </>
        ) : verificationComplete ? (
          <>
            <div className="space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Premium Activated</span>
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h3 className="font-medium">What's Unlocked:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✨ Unlimited journal entries</li>
                <li>🎵 Full access to meditation sounds</li>
                <li>📊 Advanced mood insights</li>
                <li>☁️ Cloud sync</li>
              </ul>
            </div>

            <Button onClick={handleContinue} className="w-full" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue to Your Journal
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Payment Verification Failed</h1>
                <p className="text-muted-foreground">
                  We couldn't verify your payment. Please contact support if you believe this is an error.
                </p>
              </div>
            </div>

            <Button onClick={handleContinue} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Journal
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default PaymentSuccess;