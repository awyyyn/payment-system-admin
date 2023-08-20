import { createClient } from '@supabase/supabase-js'


const role_key = import.meta.env.VITE_SUPABASE_SERVICE_KEY
const url = import.meta.env.VITE_SUPABASE_URL


const supabase = createClient(url, role_key, {
    auth: {
        autoRefreshToken: true,
        persistSession: true
    }
});

export default supabase