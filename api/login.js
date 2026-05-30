import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

import { checkRateLimit } from './_ratelimit.js';

export default async function handler(req, res) {
  if (!(await checkRateLimit(req, res))) return;

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).end();

  const { username, password } = req.body;

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Invalid username or password.' });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.setHeader('Set-Cookie',
    `saturn_session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=604800`
  );
  res.redirect(302, '/index.html');
  }

}
