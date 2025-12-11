import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if email is from VIT
export const isVITEmail = (email: string): boolean => {
  const lowerEmail = email.toLowerCase();
  return lowerEmail.endsWith('@vitstudent.ac.in') || lowerEmail.endsWith('@vit.ac.in');
};
