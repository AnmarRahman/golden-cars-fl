"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "react-i18next"
import { incrementCarView } from "@/actions/car-views"
import { useEffect, useRef, useState } from "react"
import { submitInquiry } from "@/actions/inquiry-actions"

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
  searchParams: { status?: string; source?: string }
}) {
  // Unwrap the params promise using React.use()
  const { id, lang } = React.use(params)

  const { t } = useTranslation()
  const [car, setCar] = useState<Car | null>(null)
  const [loadingCar, setLoadingCar] = useState(true)

  const hasViewIncremented = useRef(false)
  const source = searchParams.source

  useEffect(() => {
    const fetchCar = async () => {
      setLoadingCar(true)
      const carData = await getCarDetailsClient(id)
      setCar(carData)
      setLoadingCar(false)
    }

    fetchCar()

    if (source === "search" && !hasViewIncremented.current) {
      incrementCarView(id, lang)
      hasViewIncremented.current = true
    }

    return () => {
      hasViewIncremented.current = false
    }
  }, [id, lang, source])

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
