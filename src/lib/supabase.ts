import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Event {
  id: number;
  name: string;
  description: string;
  image_url: string;
  location: string;
  venue: string;
  event_date: string;
  event_time: string;
  category: string;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}
