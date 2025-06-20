import { createClient } from "@supabase/supabase-js"

// Replace the current `createClientClient` function with this singleton pattern.

let supabaseClient: ReturnType<typeof createClient> | undefined

export const createClientClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables for client client.")
  }
  if (!supabaseClient) {
    supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }
  return supabaseClient
}
