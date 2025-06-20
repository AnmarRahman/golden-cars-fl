import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea" // Import Textarea
import { getTranslation } from "@/lib/i18n"

interface Car {
  id: string
  name: string
  image_url: string
  mileage: number
  vin: string
  description: string
  model_year: number
  views: number
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

export default async function EnquirePage({
  params, // Receive params as a Promise
  searchParams,
}: {
  params: Promise<{ id: string; lang: string }> // Type params as a Promise
  searchParams: { status?: string }
}) {
  const { id, lang } = await params // Await params to get id and lang properties
  const { t } = await getTranslation(lang, "translation")
  const car = await getCarDetails(id)

  if (!car) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 text-center bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-4">{t("enquire_page.car_not_found_title")}</h1>
        <p className="text-muted-foreground">{t("enquire_page.car_not_found_description")}</p>
      </div>
    )
  }

  const handleEnquiry = async (formData: FormData) => {
    "use server"

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone_number = formData.get("phone_number") as string
    const message = formData.get("message") as string // Get the message

    const supabase = createServerClient()
    const { error } = await supabase.from("enquiries").insert({
      name,
      email,
      phone_number,
      car_id: car.id,
      message, // Include the message in the insert
    })

    if (error) {
      console.error("Error submitting enquiry:", error.message)
      redirect(`/${lang}/cars/${car.id}/enquire?status=error`)
    }

    // Redirect to homepage on success
    redirect(`/${lang}?enquiryStatus=success`)
  }

  const status = searchParams.status

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 bg-background text-foreground">
      <Card className="w-full max-w-2xl mx-auto bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {t("enquire_page.title", { carName: car.name })}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {t("enquire_page.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 text-center">
              {t("enquire_page.success_message")}
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 text-center">
              {t("enquire_page.error_message")}
            </div>
          )}
          <form action={handleEnquiry} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("enquire_page.full_name")}</Label>
              <Input id="name" name="name" type="text" placeholder={t("enquire_page.placeholder_full_name")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("enquire_page.email")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("enquire_page.placeholder_email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">{t("enquire_page.phone_number")}</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder={t("enquire_page.placeholder_phone_number")}
              />
            </div>
            {/* New Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message">{t("enquire_page.message")}</Label>
              <Textarea
                id="message"
                name="message"
                placeholder={t("enquire_page.placeholder_message")}
                rows={5}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t("enquire_page.submit_enquiry")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
