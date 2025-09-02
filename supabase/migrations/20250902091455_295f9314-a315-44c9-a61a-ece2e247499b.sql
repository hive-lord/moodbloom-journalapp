-- Create table to track user payments and premium status
CREATE TABLE public.user_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_session_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  has_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payments" 
ON public.user_payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can manage payments" 
ON public.user_payments 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_payments_updated_at
BEFORE UPDATE ON public.user_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();