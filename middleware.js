export default function middleware(req) {
  const cookie = req.headers.get('cookie') || '';

  if (!cookie.includes('saturn_session=')) {
    const url = new URL('/', req.url);
    return Response.redirect(url, 302);
  }

  return new Response(null, { status: 200 });
}

export const config = {
  matcher: ['/dashboard', '/dashboard.html']
};
