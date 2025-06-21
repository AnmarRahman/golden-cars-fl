"use server"

import { createServerClient, createSupabaseServerComponentClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { uploadImages } from "@/actions/upload-images" // Import uploadImages

export async function handleChangePassword(formData: FormData, lang: string) {
    const newPassword = formData.get("new_password") as string
    const confirmPassword = formData.get("confirm_password") as string

    if (newPassword !== confirmPassword) {
        console.error("Password change error: Passwords do not match.")
        redirect(`/${lang}/admin/dashboard?status=error&message=${encodeURIComponent("Passwords do not match.")}`)
    }

    const supabase = await createSupabaseServerComponentClient()
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) {
        console.error("Password change error:", error.message)
        redirect(
            `/${lang}/admin/dashboard?status=error&message=${encodeURIComponent(`Failed to change password: ${error.message}`)}`,
        )
    }

    revalidatePath(`/${lang}/admin/dashboard`)
    redirect(`/${lang}/admin/dashboard?status=success&message=${encodeURIComponent("Password updated successfully!")}`)
}

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

    let imageUrls: string[] = []
    try {
        imageUrls = await uploadImages(formData)
    } catch (uploadError) {
        console.error("Failed to upload images:", uploadError)
        redirect(`/${lang}/admin/dashboard?status=error&message=${encodeURIComponent("Failed to upload images.")}`)
    }

    const price = priceString ? Number.parseFloat(priceString) : null

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
    })

    if (error) {
        console.error("Error adding car:", error.message)
        redirect(
            `/${lang}/admin/dashboard?status=error&message=${encodeURIComponent(`Failed to add car: ${error.message}`)}`,
        )
    } else {
        revalidatePath(`/${lang}/admin/dashboard`)
        revalidatePath(`/${lang}/cars`)
        redirect(`/${lang}/admin/dashboard?status=success&message=${encodeURIComponent("Car added successfully!")}`)
    }
}
