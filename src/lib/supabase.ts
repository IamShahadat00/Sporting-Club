// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This "supabaseClient" is for the BROWSER
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// This "supabaseAdmin" is for the SERVER ONLY
// We check if we are on the server before initializing with the service key
export const supabaseAdmin =
  typeof window === "undefined"
    ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
      })
    : (null as any);

export default supabaseClient;
