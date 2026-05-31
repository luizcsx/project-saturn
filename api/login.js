const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyHcaptcha(token) {
  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.HCAPTCHA_SECRET}&response=${token}`
  });
  const data = await res.json();
  return data.success === true;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed.' });

  const { username, password, captcha } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required.' });

  if (!captcha)
    return res.status(400).json({ error: 'Please complete the captcha.' });

  const captchaOk = await verifyHcaptcha(captcha);
  if (!captchaOk)
    return res.status(400).json({ error: 'Captcha verification failed. Please try again.' });

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, password_hash, duts, cores, membership, admin, banned, ban_reason')
    .eq('username', username)
    .single();

  if (error || !user)
    return res.status(401).json({ error: 'Invalid username or password.' });

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch)
    return res.status(401).json({ error: 'Invalid username or password.' });

  if (user.banned)
    return res.status(403).json({
      error: `Your account has been banned. Reason: ${user.ban_reason || 'No reason provided.'}`
    });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  const isProd = process.env.VERCEL_ENV === 'production';
  res.setHeader('Set-Cookie',
    `saturn_session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=2592000${isProd ? '; Secure' : ''}`
  );

  return res.status(200).json({ success: true, redirect: '/dashboard.html' });
};
