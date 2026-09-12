import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Try to use either VITE_ prefixed env vars or standard ones
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials missing in environment variables' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Perform a lightweight query to wake up/keep the database active
    // We can query a simple table or just get auth health.
    // Querying an arbitrary table (even if it doesn't exist) is enough to trigger a database interaction.
    const { data, error } = await supabase.from('profiles').select('id').limit(1);

    return res.status(200).json({ 
      message: 'Supabase pinged successfully to prevent pausing', 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error occurred' });
  }
}
