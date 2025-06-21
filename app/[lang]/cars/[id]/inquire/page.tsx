"use client" // This component needs to be a Client Component to use useEffect and useRef
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "react-i18next" // Use useTranslation for client component
import { incrementCarView } from "@/actions/car-views"
import { useEffect, useRef, useState } from "react" // Import useEffect, useRef, useState
import { submitInquiry } from "@/actions/inquiry-actions" // Import the new server action

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
  trim: string | null // Added trim
  cylinders: number | null // Added cylinders
}

// This function needs to be a server function if it's called directly in a Server Component.
// However, since InquirePage is now a client component, we'll fetch car details client-side or pass them as props.
// For simplicity and to keep the structure, we'll make this a client-side fetch or assume data is passed.
// For this example, I'll adapt it to be called client-side.
async function getCarDetailsClient(carId: string): Promise<Car | null> {
  const response = await fetch(`/api/cars/${carId}`) // Assuming you have an API route for car details
  if (!response.ok) {
    console.error("Error fetching car details:", response.statusText)
    return null
  }
  const data = await response.json()
  return data as Car
}

export default function InquirePage({
  params,
  searchParams,
}: {
  params: { id: string; lang: string }
  searchParams: { status?: string; source?: string }
}) {
  const { id, lang } = params
  const { t } = useTranslation() // Use useTranslation for client component
  const [car, setCar] = useState<Car | null>(null)
  const [loadingCar, setLoadingCar] = useState(true)

  const hasViewIncremented = useRef(false) // Ref to prevent double increment in Strict Mode
  const source = searchParams.source // Get the source from query parameters

  useEffect(() => {
    const fetchCar = async () => {
      setLoadingCar(true)
      const carData = await getCarDetailsClient(id) // Fetch car details client-side
      setCar(carData)
      setLoadingCar(false)
    }

    fetchCar()

    // Increment view only if source is 'search' and not already incremented
    if (source === "search" && !hasViewIncremented.current) {
      incrementCarView(id, lang)
      hasViewIncremented.current = true
    }

    // Cleanup function for Strict Mode in development
    return () => {
      hasViewIncremented.current = false
    }
  }, [id, lang, source]) // Dependencies for useEffect

  if (loadingCar) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 text-center bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-4">{t("common.loading")}</h1>
        <p className="text-muted-foreground">{t("common.please_wait")}</p>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 text-center bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-4">{t("inquire_page.car_not_found_title")}</h1>
        <p className="text-muted-foreground">{t("inquire_page.car_not_found_description")}</p>
      </div>
    )
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
          <form action={submitInquiry} className="space-y-6">
            {/* Hidden inputs for car details and language */}
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="car_id" value={car.id} />
            <input type="hidden" name="car_name" value={car.name} />
            <input type="hidden" name="car_model_year" value={car.model_year} />
            <input type="hidden" name="car_vin" value={car.vin} />
            <input type="hidden" name="car_mileage" value={car.mileage} />
            {car.price !== null && <input type="hidden" name="car_price" value={car.price} />}
            {car.body_style && <input type="hidden" name="car_body_style" value={car.body_style} />}
            {car.drivetrain && <input type="hidden" name="car_drivetrain" value={car.drivetrain} />}
            {car.trim && <input type="hidden" name="car_trim" value={car.trim} />}
            {car.cylinders !== null && <input type="hidden" name="car_cylinders" value={car.cylinders} />}

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
