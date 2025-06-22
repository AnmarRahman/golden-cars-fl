"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

interface InquiryState {
    status: "success" | "error" | null
    message: string
}

export async function submitInquiry(prevState: InquiryState | null, formData: FormData): Promise<InquiryState> {
    const lang = formData.get("lang") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone_number = formData.get("phone_number") as string
    const message = formData.get("message") as string

    // Extract car details from hidden inputs
    const car_id = formData.get("car_id") as string
    const car_name_at_inquiry = formData.get("car_name_at_inquiry") as string
    const car_model_year = Number.parseInt(formData.get("car_model_year") as string)
    const car_vin = formData.get("car_vin") as string
    const car_price = Number.parseFloat(formData.get("car_price") as string) || null
    const car_body_style = (formData.get("car_body_style") as string) || null
    const car_drivetrain = (formData.get("car_drivetrain") as string) || null
    const car_trim = (formData.get("car_trim") as string) || null
    const car_cylinders = Number.parseInt(formData.get("car_cylinders") as string) || null
    const car_custom_id = (formData.get("car_custom_id") as string) || null
    const car_status = (formData.get("car_status") as string) || null

    const supabase = createServerClient()

    try {
        const { data, error } = await supabase.from("enquiries").insert([
            {
                car_id,
                name,
                email,
                phone_number,
                message,
                car_name_at_inquiry,
                car_model_year,
                car_vin,
                car_price,
                car_body_style,
                car_drivetrain,
                car_trim,
                car_cylinders,
                car_custom_id, // New
                car_status, // New
            },
        ])

        if (error) {
            console.error("Error inserting inquiry:", error)
            return { status: "error", message: "Failed to submit inquiry. Please try again." }
        }

        // Send email notification
        try {
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: "delivered@resend.dev", // Replace with your actual recipient email
                subject: `New Car Inquiry for ${car_name_at_inquiry}`,
                html: `
          <p>You have a new inquiry for the car: <strong>${car_name_at_inquiry}</strong> (ID: ${car_custom_id || "N/A"})</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone_number || "N/A"}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Car Details:</strong></p>
          <ul>
            <li>Model Year: ${car_model_year}</li>
            <li>VIN: ${car_vin}</li>
            <li>Price: ${car_price ? `$${car_price.toLocaleString()}` : "N/A"}</li>
            <li>Body Style: ${car_body_style || "N/A"}</li>
            <li>Drivetrain: ${car_drivetrain || "N/A"}</li>
            <li>Trim: ${car_trim || "N/A"}</li>
            <li>Cylinders: ${car_cylinders || "N/A"}</li>
            <li>Status: ${car_status || "N/A"}</li>
          </ul>
          <p>View car details: <a href="${BASE_URL}/${lang}/cars/${car_id}">${BASE_URL}/${lang}/cars/${car_id}</a></p>
        `,
            })
        } catch (emailError) {
            console.error("Error sending email:", emailError)
            // Do not return error here, as inquiry was successfully saved to DB
        }

        revalidatePath(`/${lang}/cars/${car_id}`)
        return { status: "success", message: "Inquiry submitted successfully!" }
    } catch (error) {
        console.error("Unexpected error:", error)
        return { status: "error", message: "An unexpected error occurred." }
    }
}
