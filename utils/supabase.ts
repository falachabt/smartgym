import { Database } from "@/types/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vinyhygavldchjpcjxai.supabase.co";
const supabaseKey = 'sb_publishable_e11rsI8hvo3oyt_KdKULuA_5Kt5XD_o';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
        storage: AsyncStorage, 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, 
    },
});

