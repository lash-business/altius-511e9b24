/**
 * Supabase Client Configuration (STUB - DO NOT USE YET)
 * 
 * This file is a placeholder for future Supabase integration in Step 2.
 * 
 * SECURITY GUIDELINES:
 * 
 * 1. The browser client will ONLY use the anon key (VITE_SUPABASE_ANON_KEY)
 * 2. All data access MUST be protected by Row Level Security (RLS) policies
 * 3. The service_role key must NEVER be shipped to the client bundle
 * 4. Privileged operations (admin, elevated permissions) MUST run in Edge Functions
 * 
 * ENVIRONMENT VARIABLES NEEDED (Step 2):
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Public anon key (safe for client-side)
 * 
 * DO NOT ADD:
 * - SUPABASE_SERVICE_ROLE_KEY (backend only, Edge Functions only)
 * 
 * TODO: Implement in Step 2 after setting up Supabase project with RLS
 */

export function getSupabaseClient(): never {
  throw new Error(
    "Supabase client not initialized. This will be configured in Step 2."
  );
}

// Type placeholder for future implementation
export type SupabaseClient = never;
