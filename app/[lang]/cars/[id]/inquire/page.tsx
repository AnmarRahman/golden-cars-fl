"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "react-i18next"
import { useEffect, useRef, useState, useActionState } from "react" // Added useActionState
import { submitInquiry } from "@/actions/inquiry-actions" // Only submitInquiry is needed from here
import { incrementCarView } from "@/actions/car-views" // Assuming incrementCarView is in a separate file
import { useToast } from "@/hooks/use-toast" // Import useToast

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
  body_style: string | null
  drivetrain: string | null
  trim: string | null
  cylinders: number | null
}

// Client-side fetch for car details
async function getCarDetailsClient(carId: string): Promise<Car | null> {
  const response = await fetch(`/api/cars/${carId}`)
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
  params: Promise<{ id: string; lang: string }>
  searchParams: { source?: string } // Removed 'status' from searchParams
}) {
  // Unwrap the params promise using React.use()
  const { id, lang } = React.use(params)

  const { t } = useTranslation()
  const { toast } = useToast() // Initialize useToast
  const [car, setCar] = useState<Car | null>(null)
  const [loadingCar, setLoadingCar] = useState(true)

  const hasViewIncremented = useRef(false)
  const source = searchParams.source

  // Use useActionState for form submission
  const [formState, formAction, isPending] = useActionState(submitInquiry, null) // Added isPending

  // Ref for the form to reset it
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const fetchCar = async () => {
      setLoadingCar(true)
      const carData = await getCarDetailsClient(id)
      setCar(carData)
      setLoadingCar(false)
    }

    fetchCar()

    if (source === "search" && !hasViewIncremented.current) {
      // Assuming incrementCarView is a separate action or handled elsewhere
      // If it's in inquiry-actions.ts, ensure it's imported from there.
      incrementCarView(id, lang)
      hasViewIncremented.current = true
    }

    return () => {
      hasViewIncremented.current = false
    }
  }, [id, lang, source])

  // Effect to show toast based on formState
  useEffect(() => {
    if (formState) {
      toast({
        title:
          formState.status === "success" ? t("inquire_page.toast_success_title") : t("inquire_page.toast_error_title"),
        description: formState.message,
        variant: formState.status === "success" ? "default" : "destructive",
      })
      // Reset the form after successful submission
      if (formState.status === "success" && formRef.current) {
        formRef.current.reset()
      }
    }
  }, [formState, toast, t])

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
          {/* Removed conditional status messages */}
          <form action={formAction} className="space-y-6" ref={formRef}>
            {" "}
            {/* Use formAction here and added ref */}
            {/* Hidden inputs for car details and language */}
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="car_id" value={car.id} />
            <input type="hidden" name="car_name_at_inquiry" value={car.name} /> {/* Corrected name */}
            <input type="hidden" name="car_model_year" value={car.model_year} />
            <input type="hidden" name="car_vin" value={car.vin} />
            <input type="hidden" name="car_mileage" value={car.mileage} />
            {car.price !== null && <input type="hidden" name="car_price" value={car.price} />}
            {car.body_style && <input type="hidden" name="car_body_style" value={car.body_style} />}
            {car.drivetrain && <input type="hidden" name="car_drivetrain" value={car.drivetrain} />}
            {car.trim && <input type="hidden" name="car_trim" value={car.trim} />}
            {car.cylinders !== null && <input type="hidden" name="car_cylinders" value={car.cylinders} />}
            {/* Add custom_id and status if available in the Car interface and passed from server */}
            {/* {car.custom_id && <input type="hidden" name="car_custom_id" value={car.custom_id} />} */}
            {/* {car.status && <input type="hidden" name="car_status" value={car.status} />} */}
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("inquire_page.submitting") : t("inquire_page.submit_inquiry")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
