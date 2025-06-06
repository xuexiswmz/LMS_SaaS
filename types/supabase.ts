import { Database} from "@/types/database";
import {createClient} from "@supabase/supabase-js";

declare global{
    type SupabaseClient = ReturnType<typeof createClient>
}
export type { Database }