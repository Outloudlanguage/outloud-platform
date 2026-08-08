import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kuvsmrheywhzxfiyivtg.supabase.co';
const supabaseAnonKey = 'sb_publishable_tnPhX4M-lnNRnap-_JF5vA_aWfJkFIr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);