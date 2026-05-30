const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

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

  const { username, password, password_confirmation, email, captcha } = req.body;

  if (!username || username.length < 3 || username.length > 20)
    return res.status(400).json({ error: 'Username must be 3–20 characters.' });

  if (!/^[a-zA-Z0-9_-]+$/.test(username))
    return res.status(400).json({ error: 'Username can only contain letters, numbers, _ and -.' });

  if (!password || password.length < 6 || password.length > 72)
    return res.status(400).json({ error: 'Password must be 6–72 characters.' });

  if (password !== password_confirmation)
    return res.status(400).json({ error: 'Passwords do not match.' });

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address.' });

  if (!captcha)
    return res.status(400).json({ error: 'Please complete the captcha.' });

  const captchaOk = await verifyHcaptcha(captcha);
  if (!captchaOk)
    return res.status(400).json({ error: 'Captcha verification failed. Please try again.' });

  const hash = await bcrypt.hash(password, 12);

  const { error } = await supabase
    .from('users')
    .insert({ username, email: email || null, password_hash: hash });

  if (error) {
    if (error.code === '23505') {
      const field = error.message.includes('email') ? 'Email' : 'Username';
      return res.status(409).json({ error: `${field} is already taken.` });
    }
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }

  return res.status(200).json({ success: true });
};
