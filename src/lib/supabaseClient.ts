import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Environment variables'dan olish (.env faylidan)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase konfiguratsiyasi topilmadi!\n\n" +
    "Iltimos, loyiha ildizida .env fayl yarating va quyidagilarni kiriting:\n\n" +
    "VITE_SUPABASE_URL=https://your-project-ref.supabase.co\n" +
    "VITE_SUPABASE_ANON_KEY=your_anon_key_here\n\n" +
    "Batafsil ma'lumot uchun SETUP.md faylini ko'ring."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
