import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Crown, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  trigger?: React.ReactNode;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ trigger }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          amount: 500, // $5.00 in cents
          description: '10 Additional Journal Entries'
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 flex items-center gap-2"
          >
            <Crown className="h-4 w-4" />
            Upgrade
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Unlock More Journal Entries</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-calm text-white text-center">
            <div className="space-y-2">
              <Sparkles className="h-8 w-8 mx-auto opacity-90" />
              <h3 className="text-lg font-medium">Unlock More Entries</h3>
              <p className="text-sm opacity-90">
                Get 10 additional journal entries for your wellness journey
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h4 className="font-medium text-foreground">What you get:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✨ 10 additional journal entries</li>
                <li>🎵 Full access to meditation sounds</li>
                <li>📊 Advanced mood insights</li>
                <li>☁️ Cloud sync (with account)</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="font-medium">10 More Entries</span>
                <span className="text-2xl font-bold text-primary">$5</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                One-time purchase • No subscription
              </p>
            </div>

            <Button 
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full shadow-soft hover:shadow-glow"
              size="lg"
            >
              {isLoading ? (
                "Opening checkout..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase Now - $5
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};