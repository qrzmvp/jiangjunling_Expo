import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbspfrjxokthzvdmibuo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdic3Bmcmp4b2t0aHp2ZG1pYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTA3NDIsImV4cCI6MjA4MjA2Njc0Mn0.k3ThDJVhf8yf0kw4dpbqWwQpfJMQkPgX5bwmU7zLghc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
