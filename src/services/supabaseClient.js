import { createClient } from '@supabase/supabase-js';

// Create a new Supabase client which handles the connection to your database with the provided URL and key
// The URL and key are stored in the .env file and are accessed through the import.meta.env object and need to be secret

const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_REACT_APP_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase;


