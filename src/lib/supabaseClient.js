import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validasi environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function untuk error handling
export const handleSupabaseError = (error) => {
  console.error('Supabase Error:', error);
  return {
    success: false,
    error: error.message || 'Terjadi kesalahan pada server'
  };
};

// Helper function untuk success response
export const handleSupabaseSuccess = (data) => {
  return {
    success: true,
    data
  };
};
