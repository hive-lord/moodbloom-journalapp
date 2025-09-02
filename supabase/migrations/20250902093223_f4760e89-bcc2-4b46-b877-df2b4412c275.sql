-- First, remove the overly permissive policy
DROP POLICY IF EXISTS "Edge functions can manage payments" ON public.user_payments;

-- Create more specific, secure policies for edge functions

-- Policy for edge functions to INSERT payment records (service role only)
CREATE POLICY "Service role can insert payments" 
ON public.user_payments 
FOR INSERT 
WITH CHECK (
  -- Only allow if the current role is service_role (edge functions with service key)
  current_setting('role') = 'service_role' OR 
  -- Or if it's the authenticated user creating their own payment record
  (auth.uid() = user_id AND auth.role() = 'authenticated')
);

-- Policy for edge functions to UPDATE payment status (service role only)
CREATE POLICY "Service role can update payment status" 
ON public.user_payments 
FOR UPDATE 
USING (
  -- Only allow service role to update payment records
  current_setting('role') = 'service_role'
)
WITH CHECK (
  -- Only allow service role to update payment records
  current_setting('role') = 'service_role'
);

-- Policy for users to SELECT their own payment records
CREATE POLICY "Users can view own payments only" 
ON public.user_payments 
FOR SELECT 
USING (
  -- Users can only see their own payment records
  auth.uid() = user_id
);

-- Ensure no DELETE operations are allowed (payments should be immutable)
-- No DELETE policy = no one can delete payment records