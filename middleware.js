import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/dashboard.html']
};

export default function middleware(req) {
  const cookie = req.cookies.get('saturn_session');

  if (!cookie || !cookie.value) {
    return NextResponse.redirect(new URL('/index.html', req.url));
  }

  return NextResponse.next();
}
