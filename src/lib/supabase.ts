
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pksvdmpdmloyrhlnfihn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrc3ZkbXBkbWxveXJobG5maWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA0ODgsImV4cCI6MjA1ODM4NjQ4OH0.H6zORZy4zGBNoPhPQOHBCenN_5OLWtKNFwSN5uc-azo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
