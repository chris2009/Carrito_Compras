import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'shopflow.app'

  let storeSlug: string | null = null

  const isSubdomain = hostname.endsWith(`.${appDomain}`) && !hostname.startsWith('www.')
  if (isSubdomain) {
    storeSlug = hostname.replace(`.${appDomain}`, '')
  } else {
    storeSlug =
      request.nextUrl.searchParams.get('store') ||
      request.headers.get('x-store-slug') ||
      null
  }

  // Patrón correcto Supabase SSR: cookies deben actualizarse en request Y response
  // para que los server components lean la sesión refrescada
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Propagar store slug a server components via header
  if (storeSlug) supabaseResponse.headers.set('x-store-slug', storeSlug)

  if (pathname.startsWith('/dashboard') && !user)
    return NextResponse.redirect(new URL('/login', request.url))
  if (pathname.startsWith('/onboarding') && !user)
    return NextResponse.redirect(new URL('/registro', request.url))
  if (pathname.startsWith('/superadmin') && user?.email !== process.env.SUPERADMIN_EMAIL)
    return NextResponse.redirect(new URL('/', request.url))

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
}
