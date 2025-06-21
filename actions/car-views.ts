"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function incrementCarView(carId: string, lang: string) {
    const supabase = createServerClient()

    // Fetch current views and name to ensure the trigger has the latest data
    const { data: currentCar, error: fetchError } = await supabase
        .from("cars")
        .select("views, name")
        .eq("id", carId)
        .single()

    if (fetchError || !currentCar) {
        console.error("Error fetching car for view increment:", fetchError?.message || "Car not found")
        return
    }

    const newViews = currentCar.views + 1

    const { error: updateError } = await supabase.from("cars").update({ views: newViews }).eq("id", carId)

    if (updateError) {
        console.error("Error incrementing car view:", updateError.message)
    } else {
        // Revalidate the admin dashboard path to show updated view counts
        revalidatePath(`/${lang}/admin/dashboard`)
    }
}
