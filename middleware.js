export default function middleware(req) {
  const cookie = req.headers.get('cookie') || '';
  const hasSession = cookie.includes('saturn_session=');
  const url = new URL(req.url);
  const path = url.pathname;

  if (
    path.startsWith('/cdn/') ||
    path.startsWith('/api/') ||
    path.startsWith('/css/') ||
    path.startsWith('/js/')  ||
    path.startsWith('/_vercel') ||
    path.match(/\.(js|css|png|svg|ico|jpg|jpeg|webp|woff|woff2|ttf)$/)
  ) {
    return new Response(null, { status: 200 });
  }

  const guestOnlyPaths = ['/', '/index', '/index.html', '/login', '/register'];
  if (hasSession && guestOnlyPaths.includes(path)) {
    return Response.redirect(new URL('/dashboard', req.url), 302);
  }

  if (!hasSession && (path === '/dashboard' || path === '/dashboard.html')) {
    return Response.redirect(new URL('/login', req.url), 302);
  }

  return new Response(null, { status: 200 });
}

export const config = {
  matcher: ['/((?!cdn|api|css|js|_vercel|favicon\\.ico).*)']
};
