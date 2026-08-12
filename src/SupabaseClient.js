import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  process.env.REACT_APP_SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  'https://kuvsmrheywhzxfiyivtg.supabase.co';

const supabaseAnonKey = 
  process.env.REACT_APP_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dnNtcmhleXdoenhmaXlpdnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTc4MzYsImV4cCI6MjEwMTc5MzgzNn0.upJqo4zdmO3xj4KN7zUURDTI0ZY2RNWqgvLbSSCu3BA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);