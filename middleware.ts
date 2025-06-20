import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import Negotiator from "negotiator"
import { match } from "@formatjs/intl-localematcher"

const locales = ["en", "es"] // Supported locales
const defaultLocale = "en"

function getLocale(request: NextRequest) {
  const acceptLanguageHeader = request.headers.get("accept-language")
  const languages = new Negotiator({ headers: { "accept-language": acceptLanguageHeader || "" } }).languages()
  return match(languages, locales, defaultLocale)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  // If the pathname already has a locale, proceed
  if (pathnameHasLocale) {
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Refresh Supabase session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set({
                  name,
                  value,
                  ...options,
                }),
              )
            } catch (e) {
              console.warn(
                "Error setting cookies in middleware (this might be expected if not in a response context):",
                e,
              )
            }
          },
        },
      },
    )
    await supabase.auth.getSession()
    return response
  }

  // If no locale in pathname, redirect to preferred locale
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`

  // Set a cookie to remember the preferred locale
  const response = NextResponse.redirect(request.nextUrl)
  response.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "strict" })

  // Refresh Supabase session for the redirect response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set({
                name,
                value,
                ...options,
              }),
            )
          } catch (e) {
            console.warn(
              "Error setting cookies in middleware (this might be expected if not in a response context):",
              e,
            )
          }
        },
      },
    },
  )
  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Optional: only run on root (/) URL
    // '/'
  ],
}
