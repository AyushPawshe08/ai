import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']

export function proxy(request) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('session')?.value
  const isAuthenticated = Boolean(session)

  // Redirect root → /research (auth) or /login (guest)
  if (pathname === '/') {
    const dest = isAuthenticated ? '/research' : '/login'
    return NextResponse.redirect(new URL(dest, request.nextUrl))
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Unauthenticated user hitting a protected route → /login
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  // Authenticated user hitting login/register → /research
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/research', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
}
