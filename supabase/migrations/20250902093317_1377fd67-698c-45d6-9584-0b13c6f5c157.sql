-- Remove the old permissive policy if it still exists
DROP POLICY IF EXISTS "Users can view their own payments" ON public.user_payments;

-- Also remove any other overly permissive policies that might exist
DROP POLICY IF EXISTS "Edge functions can manage payments" ON public.user_payments;