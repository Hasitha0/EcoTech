import { createClient } from '@supabase/supabase-js';

// Supabase configuration with production environment handling
const SUPABASE_PROJECT_ID = 'ovjjujxnxlxqcjhnnmbs';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92amp1anhueGx4cWNqaG5ubWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDkyMDQsImV4cCI6MjA2NTM4NTIwNH0.r4Q4jYSJ5IuX3z741lP9gHlO3bL5q8UVnVrjuKsF2N0';

// Get current domain for redirect URL configuration
const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Check for various Vercel environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  // Production fallback URL (update this to your actual production URL)
  return 'https://eco-tech-copy-7f3kavq1o-hasitha0s-projects.vercel.app';
};

// Create Supabase client
export const createSupabaseClient = () => {
  const supabaseUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
  const currentDomain = getCurrentDomain();
  
  console.log('Creating Supabase client with domain:', currentDomain);
  
  const client = createClient(supabaseUrl, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      // Configure redirect URLs for production
      redirectTo: `${currentDomain}/auth/callback`,
      // Handle email confirmation redirects
      confirmEmailRedirectTo: `${currentDomain}/confirm`
    },
    global: {
      headers: {
        'X-Client-Info': 'ecotech-web-app',
        'Access-Control-Allow-Origin': currentDomain,
        'X-Current-Domain': currentDomain
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
  
  return client;
};

// Helper function to get auth configuration
export const getAuthConfig = () => {
  const currentDomain = getCurrentDomain();
  return {
    domain: currentDomain,
    redirectUrl: `${currentDomain}/auth/callback`,
    confirmUrl: `${currentDomain}/confirm`,
    supabaseUrl: `https://${SUPABASE_PROJECT_ID}.supabase.co`
  };
};

// Export project details for debugging
export const PROJECT_CONFIG = {
  PROJECT_ID: SUPABASE_PROJECT_ID,
  SUPABASE_URL: `https://${SUPABASE_PROJECT_ID}.supabase.co`,
  getCurrentDomain
};

 