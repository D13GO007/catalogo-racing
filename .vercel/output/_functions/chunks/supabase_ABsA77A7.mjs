import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ohpkirlmsxfdvirrjmby.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocGtpcmxtc3hmZHZpcnJqbWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MTM1NTgsImV4cCI6MjA4OTE4OTU1OH0.W_94vPHSvi1-mrv6lXuiD52VNlK-q4_k7SSMFMoRaAg";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
