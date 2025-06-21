"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"

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
  brand: string | null // Added brand
  model: string | null // Added model
}

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  const router = useRouter()
  const { t, i18n } = useTranslation()

  const handleViewDetails = () => {
    router.push(`/${i18n.language}/cars/${car.id}`)
  }

  return (
    <Card className="rounded-lg shadow-lg overflow-hidden bg-card text-card-foreground flex flex-col h-full">
      <div className="relative h-48 w-full">
        <Image
          src={car.image_url[0] || "/placeholder.svg?height=300&width=400"}
          alt={car.name}
          fill
          className="object-cover object-center"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-bold">{car.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t("cars_page.year")}: {car.model_year}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <p className="text-lg font-semibold text-primary">
          {car.price !== null ? `$${car.price.toLocaleString()}` : t("cars_page.call_for_price")}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">{t("cars_page.mileage")}:</span> {car.mileage.toLocaleString()} miles
        </p>
        {car.brand && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">{t("cars_page.brand")}:</span> {car.brand}
          </p>
        )}
        {car.model && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">{t("cars_page.model")}:</span> {car.model}
          </p>
        )}
        {car.body_style && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">{t("cars_page.body_style")}:</span>{" "}
            {t(`search_form.${car.body_style.toLowerCase()}`)}
          </p>
        )}
        {car.drivetrain && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">{t("cars_page.drivetrain")}:</span>{" "}
            {t(`search_form.${car.drivetrain.toLowerCase()}`)}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">{t("cars_page.vin")}:</span> {car.vin}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handleViewDetails} className="w-full">
          {t("cars_page.view_details")}
        </Button>
        <Link href={`/${i18n.language}/cars/${car.id}/inquire`} className="w-full">
          <Button variant="outline" className="w-full bg-black text-white">
            {t("cars_page.inquire_now")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
