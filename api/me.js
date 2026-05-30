const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  const raw = req.headers.cookie || '';
  const match = raw.match(/saturn_session=([^;]+)/);

  if (!match)
    return res.status(200).json({});

  let payload;
  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch {
    return res.status(200).json({});
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, duts, cores, membership, admin')
    .eq('id', payload.id)
    .single();

  if (error || !user)
    return res.status(200).json({});

  return res.status(200).json({
    id: user.id,
    username: user.username,
    duts: user.duts,
    cores: user.cores,
    membership: user.membership,
    admin: user.admin ?? false,
    authenticated: true
  });
};
