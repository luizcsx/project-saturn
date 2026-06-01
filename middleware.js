export default function middleware(req) {
  const cookie = req.headers.get('cookie') || '';
  const hasSession = cookie.includes('saturn_session=');
  const url = new URL(req.url);
  const path = url.pathname;

  if (hasSession && (path === '/' || path === '/index' || path === '/login' || path === '/register')) {
    return Response.redirect(new URL('/dashboard', req.url), 302);
  }

  if (!hasSession && (path === '/dashboard' || path === '/dashboard.html')) {
    return Response.redirect(new URL('/login', req.url), 302);
  }

  return;
}

export const config = {
  matcher: ['/((?!cdn|api|css|js|_vercel|favicon\\.ico).*)']
};
