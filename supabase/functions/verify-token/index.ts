// @ts-ignore Deno import
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore Supabase import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define environment fallbacks for local development
const SUPABASE_URL = 
  // @ts-ignore Deno global
  typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_URL') : process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY = 
  // @ts-ignore Deno global
  typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') : process.env.SUPABASE_SERVICE_ROLE_KEY;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client with the admin key
    const supabaseAdmin = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? '',
      { auth: { persistSession: false } }
    );
    
    // Verify the token
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      return new Response(
        JSON.stringify({ valid: false, error: error?.message || 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Check if user is blocked
    const { data: blockData } = await supabaseAdmin
      .from('security_events')
      .select('*')
      .eq('user_id', data.user.id)
      .eq('event_type', 'account_blocked')
      .limit(1);
      
    if (blockData && blockData.length > 0) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Account blocked' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Record this validation
    await supabaseAdmin
      .from('security_events')
      .insert({
        event_type: 'token_validation',
        user_id: data.user.id,
        details: { 
          ip_address: req.headers.get('x-forwarded-for'),
          user_agent: req.headers.get('user-agent')
        }
      });
    
    return new Response(
      JSON.stringify({ 
        valid: true, 
        permissions: data.user.user_metadata?.permissions || [],
        role: data.user.user_metadata?.role || 'user',
        userId: data.user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Token validation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        valid: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});