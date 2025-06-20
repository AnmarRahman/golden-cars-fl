"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function incrementCarView(carId: string, lang: string) {
    const supabase = createServerClient() // Use the service role client for direct database updates

    const { data, error } = await supabase
        .from("cars")
        .update({ views: (await supabase.from("cars").select("views").eq("id", carId).single()).data?.views! + 1 })
        .eq("id", carId)

    if (error) {
        console.error("Error incrementing car view:", error.message)
    } else {
        // Revalidate the admin dashboard path to show updated view counts
        revalidatePath(`/${lang}/admin/dashboard`)
    }
}
