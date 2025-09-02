import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using service role key for database writes
  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Get request body
    const { amount = 500, description = "Premium Upgrade - Unlimited Journal Entries" } = await req.json();

    // Try to get authenticated user (optional for one-off payments)
    let userEmail = "guest@calmjournal.app";
    let userId = null;
    
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        // Use anon client for auth verification
        const anonClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );
        const token = authHeader.replace("Bearer ", "");
        const { data } = await anonClient.auth.getUser(token);
        if (data.user?.email) {
          userEmail = data.user.email;
          userId = data.user.id;
        }
      }
    } catch (authError) {
      // Continue with guest checkout if auth fails
      console.log("Auth failed, proceeding with guest checkout");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: description,
              description: "Unlock unlimited journal entries for your wellness journey"
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/?payment=canceled`,
      metadata: {
        user_id: userId || "guest",
        email: userEmail,
        product_type: "premium_upgrade"
      }
    });

    // Record payment intent in Supabase for tracking
    if (userId) {
      try {
        await supabaseService.from("user_payments").insert({
          user_id: userId,
          stripe_session_id: session.id,
          amount: amount,
          status: "pending",
          created_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.error("Database logging error:", dbError);
        // Continue anyway - payment is more important than logging
      }
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create payment session" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});