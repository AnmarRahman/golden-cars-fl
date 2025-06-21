"use server"

import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { sendEmail } from "@/actions/send-email"
import { useTranslation } from "@/lib/i18n" // Import server-side useTranslation

export async function submitInquiry(formData: FormData) {
    // Extract lang and car details from hidden input fields
    const lang = formData.get("lang") as string
    const carId = formData.get("car_id") as string
    const carName = formData.get("car_name") as string
    const carModelYear = Number.parseInt(formData.get("car_model_year") as string)
    const carVin = formData.get("car_vin") as string
    const carMileage = Number.parseInt(formData.get("car_mileage") as string)
    const carPrice = formData.get("car_price") ? Number.parseFloat(formData.get("car_price") as string) : null
    const carBodyStyle = formData.get("car_body_style") as string | null
    const carDrivetrain = formData.get("car_drivetrain") as string | null
    const carTrim = formData.get("car_trim") as string | null
    const carCylinders = formData.get("car_cylinders") ? Number.parseInt(formData.get("car_cylinders") as string) : null

    const { t: tAction } = await useTranslation(lang, "translation")

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone_number = formData.get("phone_number") as string
    const message = formData.get("message") as string

    const supabase = createServerClient()
    const { error } = await supabase.from("enquiries").insert({
        name,
        email,
        phone_number,
        car_id: carId,
        car_name_at_inquiry: carName, // Store the car name at the time of inquiry
        message,
    })

    if (error) {
        console.error("Error submitting inquiry:", error.message)
        redirect(`/${lang}/cars/${carId}/inquire?status=error`)
    }

    // Send email notification to the dealership
    const dealershipEmailResult = await sendEmail({
        to: "goldencarsfl@gmail.com", // Dealership email
        subject: `New Car Inquiry: ${carName} (${carModelYear}) from ${name}`,
        html: `
      <p>You have a new inquiry for the car: <strong>${carName} (${carModelYear})</strong>.</p>
      <p><strong>Customer Name:</strong> ${name}</p>
      <p><strong>Customer Email:</strong> ${email}</p>
      <p><strong>Customer Phone:</strong> ${phone_number || "N/A"}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <br/>
      <p>Car VIN: ${carVin}</p>
      <p>Car Mileage: ${carMileage.toLocaleString()} miles</p>
      <p>Car Price: ${carPrice !== null ? `$${carPrice.toLocaleString()}` : "Call for Price"}</p>
      ${carBodyStyle ? `<p>Car Body Style: ${tAction(`search_form.${carBodyStyle.toLowerCase()}`)}</p>` : ""}
      ${carDrivetrain ? `<p>Car Drivetrain: ${tAction(`search_form.${carDrivetrain.toLowerCase()}`)}</p>` : ""}
      ${carTrim ? `<p>Car Trim: ${carTrim}</p>` : ""}
      ${carCylinders ? `<p>Car Cylinders: ${carCylinders}</p>` : ""}
      <p>View car details: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/cars/${carId}">${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/cars/${carId}</a></p>
    `,
        fromDisplayName: "Golden Cars FL", // Friendly name for the sender
        replyTo: email, // Replies go to the customer's email
    })

    if (!dealershipEmailResult.success) {
        console.error("Dealership email failed to send.")
        redirect(`/${lang}/cars/${carId}/inquire?status=error`)
    }

    redirect(`/${lang}?inquiryStatus=success`)
}
