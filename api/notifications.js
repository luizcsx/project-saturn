const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed.' });

  const { data, error } = await supabase
    .from('site_notifications')
    .select('id, message, type')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }

  return res.status(200).json(data || []);
};
