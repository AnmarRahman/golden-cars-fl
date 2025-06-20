import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createBrowserClient } from "@supabase/ssr"

// Create a single Supabase client for interacting with your database on the server.
// This client uses the SERVICE_ROLE_KEY for full access and bypasses RLS.
// It does not persist sessions.
export const createServerClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables for server client.")
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  })
}

// This client is for Server Components that need to read the user's session from cookies.
// It uses the anon key and respects RLS.
export const createSupabaseServerComponentClient = async () => {
  const cookieStore = await cookies()

  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch (e) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.warn("Error setting cookies in Server Component:", e)
        }
      },
    },
  })
}
