const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabaseAdmin = null;
let supabaseClient = null;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Please check your .env file.');
  console.warn('⚠️ Supabase services will be unavailable.');
} else {
  try {
    // Service role client for server-side administrative tasks
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Standard client for operations acting on behalf of a user
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Supabase initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase:', err.message);
  }
}

module.exports = { supabaseAdmin, supabaseClient };
