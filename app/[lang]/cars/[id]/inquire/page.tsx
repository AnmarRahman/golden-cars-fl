import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { getTranslation } from "@/lib/i18n"
import { sendEmail } from "@/actions/send-email"

interface Car {
  id: string
  name: string
  image_url: string[]
  mileage: number
  vin: string
  description: string
  model_year: number
  views: number
  price: number | null
  body_style: string | null // Added body_style
  drivetrain: string | null // Added drivetrain
}

async function getCarDetails(carId: string): Promise<Car | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("cars").select("*").eq("id", carId).single()

  if (error) {
    console.error("Error fetching car details:", error)
    return null
  }
  return data as Car
}

export default async function InquirePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; lang: string }>
  searchParams: { status?: string }
}) {
  const { id, lang } = await params
  const { t } = await getTranslation(lang, "translation")
  const car = await getCarDetails(id)

  if (!car) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 text-center bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-4">{t("inquire_page.car_not_found_title")}</h1>
        <p className="text-muted-foreground">{t("inquire_page.car_not_found_description")}</p>
      </div>
    )
  }

  const handleInquiry = async (formData: FormData) => {
    "use server"

    const { t: tAction } = await getTranslation(lang, "translation")

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone_number = formData.get("phone_number") as string
    const message = formData.get("message") as string

    const supabase = createServerClient()
    const { error } = await supabase.from("enquiries").insert({
      name,
      email,
      phone_number,
      car_id: car.id,
      message,
    })

    if (error) {
      console.error("Error submitting inquiry:", error.message)
      redirect(`/${lang}/cars/${car.id}/inquire?status=error`)
    }

    // Send email notification to the dealership
    const dealershipEmailResult = await sendEmail({
      to: "goldencarsfl@gmail.com", // Dealership email
      subject: `New Car Inquiry: ${car.name} (${car.model_year}) from ${name}`,
      html: `
        <p>You have a new inquiry for the car: <strong>${car.name} (${car.model_year})</strong>.</p>
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Customer Phone:</strong> ${phone_number || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <br/>
        <p>Car VIN: ${car.vin}</p>
        <p>Car Mileage: ${car.mileage.toLocaleString()} miles</p>
        <p>Car Price: ${car.price !== null ? `$${car.price.toLocaleString()}` : "Call for Price"}</p>
        ${car.body_style ? `<p>Car Body Style: ${tAction(`search_form.${car.body_style.toLowerCase()}`)}</p>` : ""}
        ${car.drivetrain ? `<p>Car Drivetrain: ${tAction(`search_form.${car.drivetrain.toLowerCase()}`)}</p>` : ""}
        <p>View car details: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/cars/${car.id}">${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/cars/${car.id}</a></p>
      `,
      fromDisplayName: "Golden Cars FL", // Friendly name for the sender
      replyTo: email, // Replies go to the customer's email
    })

    // Removed customer confirmation email for now as per your request.
    // const customerEmailResult = await sendEmail({ ... });

    if (!dealershipEmailResult.success) {
      // Only check dealership email result
      console.error("Dealership email failed to send.")
      redirect(`/${lang}/cars/${car.id}/inquire?status=error`)
    }

    redirect(`/${lang}?inquiryStatus=success`)
  }

  const status = searchParams.status

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 bg-background text-foreground">
      <Card className="w-full max-w-2xl mx-auto bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {t("inquire_page.title", { carName: car.name })}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {t("inquire_page.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 text-center">
              {t("inquire_page.success_message")}
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 text-center">
              {t("inquire_page.error_message")}
            </div>
          )}
          <form action={handleInquiry} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("inquire_page.full_name")}</Label>
              <Input id="name" name="name" type="text" placeholder={t("inquire_page.placeholder_full_name")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("inquire_page.email")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("inquire_page.placeholder_email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">{t("inquire_page.phone_number")}</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder={t("inquire_page.placeholder_phone_number")}
              />
            </div>
            {/* New Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message">{t("inquire_page.message")}</Label>
              <Textarea
                id="message"
                name="message"
                placeholder={t("inquire_page.placeholder_message")}
                rows={5}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t("inquire_page.submit_inquiry")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
