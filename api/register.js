import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).end();

  const { username, password, email } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required.' });

  const hash = await bcrypt.hash(password, 12);

  const { error } = await supabase
    .from('users')
    .insert({ username, email: email || null, password_hash: hash });

  if (error) {
    if (error.code === '23505')
      return res.status(409).json({ error: 'Username or email already taken.' });
    return res.status(500).json({ error: 'Registration failed.' });
  }

  res.redirect(302, '/login.html?registered=1');
}
