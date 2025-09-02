import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // In a real app, you might verify the payment with your backend
    // For now, we'll just show success if session_id exists
    if (sessionId) {
      setIsVerified(true);
      
      // Update local storage to add 10 more entries for guest users
      const guestData = JSON.parse(localStorage.getItem('calmJournal_guestData') || '{}');
      const currentLimit = guestData.paidEntries || 0;
      guestData.paidEntries = currentLimit + 10;
      localStorage.setItem('calmJournal_guestData', JSON.stringify(guestData));
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for supporting your wellness journey
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <Sparkles className="h-8 w-8 text-primary mx-auto" />
            <h2 className="font-semibold text-foreground">What you unlocked:</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">10 additional journal entries</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <span className="text-sm">Full access to meditation sounds</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
              <span className="text-sm">Advanced mood insights</span>
            </div>
          </div>

          {sessionId && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Transaction ID: {sessionId.slice(-12)}...
              </p>
            </div>
          )}
        </Card>

        <div className="space-y-3">
          <Button asChild className="w-full shadow-soft hover:shadow-glow">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Journaling
            </Link>
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Your purchase has been processed securely by Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;