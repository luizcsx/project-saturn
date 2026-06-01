const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getUser(req) {
  const raw = req.headers.cookie || '';
  const match = raw.match(/saturn_session=([^;]+)/);
  if (!match) return null;
  try { return jwt.verify(match[1], process.env.JWT_SECRET); }
  catch { return null; }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed.' });

  const user = getUser(req);
  
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_url, author_name, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (!user) {
    return res.status(200).json({
      posts: posts || [],
      feed: [],
      friend_requests: 0,
      authenticated: false
    });
  }

  const { data: friends } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', user.id)
    .eq('status', 'accepted');

  const friendIds = (friends || []).map(f => f.friend_id);

  let feed = [];
  if (friendIds.length > 0) {
    const { data: statuses } = await supabase
      .from('user_statuses')
      .select('message, updated_at, user_id, users(id, username)')
      .in('user_id', friendIds)
      .neq('message', '')
      .order('updated_at', { ascending: false })
      .limit(20);
    feed = statuses || [];
  }

  const { count: friend_requests } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .eq('friend_id', user.id)
    .eq('status', 'pending');

  return res.status(200).json({
    posts: posts || [],
    feed,
    friend_requests: friend_requests || 0,
    authenticated: true
  });
};
