// Supabase Configuration
// Replace these with your actual Supabase project credentials

const SUPABASE_URL = 'https://egzlzzdvcdfkjqowqiua.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnemx6emR2Y2Rma2pxb3dxaXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDI0MjMsImV4cCI6MjA4MDU3ODQyM30.7IrNZ_3JG2JO-nvwPq0bAhfIt3Ix4Oby_7LuWjR0xmE';

// Initialize Supabase Client - using different variable name to avoid conflict
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.supabaseClient = supabaseClient;
