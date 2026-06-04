const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed.' });

  const raw = req.headers.cookie || '';
  const match = raw.match(/saturn_session=([^;]+)/);
  if (!match) return res.status(401).json({ error: 'Not logged in.' });

  let user;
  try { user = jwt.verify(match[1], process.env.JWT_SECRET); }
  catch { return res.status(401).json({ error: 'Invalid session.' }); }

  const { message } = req.body;
  if (typeof message !== 'string')
    return res.status(400).json({ error: 'Invalid message.' });
  if (message.trim().length > 200)
    return res.status(400).json({ error: 'Status too long (max 200 chars).' });

  const { error } = await supabase
    .from('user_statuses')
    .upsert(
      { user_id: user.id, message: message.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Status error:', error);
    return res.status(500).json({ error: 'Failed to update status.' });
  }

  return res.status(200).json({ success: true });
};
