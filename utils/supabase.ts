import { Database } from "@/types/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from "@supabase/supabase-js";
import Constants from 'expo-constants';

const supabaseUrl = "https://vinyhygavldchjpcjxai.supabase.co";
const supabaseKey = 'sb_publishable_e11rsI8hvo3oyt_KdKULuA_5Kt5XD_o';

// Détermine la plateforme de manière fiable
const getPlatform = () => {
  if (Constants.platform?.ios) return 'ios';
  if (Constants.platform?.android) return 'android';
  return 'web';
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
        storage: AsyncStorage, 
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, 
    },
    global: {
        headers: {
            'expo-platform': getPlatform(),
        },
    },
});

