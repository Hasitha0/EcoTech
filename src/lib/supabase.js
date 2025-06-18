import { createSupabaseClient } from './supabase-config.js';

// Create Supabase client
export const supabase = createSupabaseClient();

// Export for convenience
export default supabase; 