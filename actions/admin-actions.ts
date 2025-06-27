"use server"

import { createServerClient, createSupabaseServerComponentClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function handleChangePassword(formData: FormData, lang: string) {
    const newPassword = formData.get("new_password") as string
    const confirmPassword = formData.get("confirm_password") as string

    if (newPassword !== confirmPassword) {
        console.error("Password change error: Passwords do not match.")
        return { status: "error", message: "Passwords do not match." }
    }

    const supabase = await createSupabaseServerComponentClient()
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) {
        console.error("Password change error:", error.message)
        return { status: "error", message: `Failed to change password: ${error.message}` }
    }

    revalidatePath(`/${lang}/admin/dashboard`)
    return { status: "success", message: "Password updated successfully!" }
}

/**
 * Handles logging out the admin user
 */
export async function handleLogout(lang: string) {
    const supabase = await createSupabaseServerComponentClient()
    await supabase.auth.signOut()
    redirect(`/${lang}/admin`)
}

export async function handleDeleteCar(carId: string, lang: string) {
    const supabase = createServerClient()
    const { error } = await supabase.from("cars").delete().eq("id", carId)

    if (error) {
        console.error("Error deleting car:", error.message)
    } else {
        revalidatePath(`/${lang}/admin/dashboard`)
        revalidatePath(`/${lang}/cars`)
    }
}

export async function handleAddCar(formData: FormData, lang: string) {
    const name = formData.get("name") as string
    const mileage = Number.parseInt(formData.get("mileage") as string)
    const vin = formData.get("vin") as string
    const description = formData.get("description") as string
    const model_year = Number.parseInt(formData.get("model_year") as string)
    const priceString = formData.get("price") as string
    const body_style = formData.get("body_style") as string
    const drivetrain = formData.get("drivetrain") as string
    const brand = formData.get("brand") as string
    const model = formData.get("model") as string
    const trim = formData.get("trim") as string
    const cylindersString = formData.get("cylinders") as string
    const custom_id_prefix = formData.get("custom_id_prefix") as string
    const custom_id_number = formData.get("custom_id_number") as string
    const status = formData.get("status") as string

    // Retrieve image URLs directly from formData, as they were already uploaded by the client
    const imageUrls = formData.getAll("image_url") as string[]

    const price = priceString ? Number.parseFloat(priceString) : null
    const cylinders = cylindersString ? Number.parseInt(cylindersString) : null
    const custom_id = custom_id_prefix && custom_id_number ? `${custom_id_prefix}#${custom_id_number}` : null

    const supabase = createServerClient()
    const { error } = await supabase.from("cars").insert({
        name,
        image_url: imageUrls,
        mileage,
        vin,
        description,
        model_year,
        price,
        body_style: body_style === "null" ? null : body_style,
        drivetrain: drivetrain === "null" ? null : drivetrain,
        brand: brand || null,
        model: model || null,
        trim: trim || null,
        cylinders: cylinders,
        custom_id,
        status: status || "available",
    })

    if (error) {
        console.error("Error adding car:", error.message)
        return { status: "error", message: `Failed to add car: ${error.message}` }
    } else {
        revalidatePath(`/${lang}/admin/dashboard`)
        revalidatePath(`/${lang}/cars`)
        return { status: "success", message: "Car added successfully!" }
    }
}

export async function handleUpdateCarStatus(carId: string, newStatus: string, lang: string) {
    const supabase = createServerClient()
    const { error } = await supabase.from("cars").update({ status: newStatus }).eq("id", carId)

    if (error) {
        console.error("Error updating car status:", error.message)
        return { status: "error", message: `Failed to update status: ${error.message}` }
    } else {
        revalidatePath(`/${lang}/admin/dashboard`)
        revalidatePath(`/${lang}/cars`)
        revalidatePath(`/${lang}/cars/${carId}`)
        return { status: "success", message: "Car status updated successfully!" }
    }
}

export async function handleUpdateCar(carId: string, formData: FormData, lang: string) {
    const name = formData.get("name") as string
    const mileage = Number.parseInt(formData.get("mileage") as string)
    const vin = formData.get("vin") as string
    const description = formData.get("description") as string
    const model_year = Number.parseInt(formData.get("model_year") as string)
    const priceString = formData.get("price") as string
    const body_style = formData.get("body_style") as string
    const drivetrain = formData.get("drivetrain") as string
    const brand = formData.get("brand") as string
    const model = formData.get("model") as string
    const trim = formData.get("trim") as string
    const cylindersString = formData.get("cylinders") as string
    const custom_id_prefix = formData.get("custom_id_prefix") as string
    const custom_id_number = formData.get("custom_id_number") as string
    const status = formData.get("status") as string

    // Retrieve image URLs directly from formData, as they were already uploaded by the client
    // This array will contain both existing and newly uploaded image URLs
    const imageUrls = formData.getAll("image_url") as string[]

    const price = priceString ? Number.parseFloat(priceString) : null
    const cylinders = cylindersString ? Number.parseInt(cylindersString) : null
    const custom_id = custom_id_prefix && custom_id_number ? `${custom_id_prefix}#${custom_id_number}` : null

    const supabase = createServerClient()
    const { error } = await supabase
        .from("cars")
        .update({
            name,
            image_url: imageUrls,
            mileage,
            vin,
            description,
            model_year,
            price,
            body_style: body_style === "null" ? null : body_style,
            drivetrain: drivetrain === "null" ? null : drivetrain,
            brand: brand || null,
            model: model || null,
            trim: trim || null,
            cylinders: cylinders,
            custom_id,
            status: status || "available",
        })
        .eq("id", carId)

    if (error) {
        console.error("Error updating car:", error.message)
        return { status: "error", message: `Failed to update car: ${error.message}` }
    } else {
        revalidatePath(`/${lang}/admin/dashboard`)
        revalidatePath(`/${lang}/cars`)
        revalidatePath(`/${lang}/cars/${carId}`) // Revalidate specific car page
        return { status: "success", message: "Car updated successfully!" }
    }
}
