"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"

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
  brand: string | null
  model: string | null
  trim: string | null
  cylinders: number | null
  custom_id: string | null
  status: string
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

  // Function to determine badge styling based on status
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "available":
        return "bg-yellow-400 text-black" // Yellow background, black text
      case "sold":
        return "bg-red-500 text-white" // Red background, white text
      case "pending":
        return "bg-amber-500 text-white" // Amber background, white text
      default:
        return "bg-gray-200 text-gray-800" // Default gray
    }
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
        {/* New: Custom ID display on top right */}
        {car.custom_id && (
          <div className="absolute top-2 right-2 bg-gray-700/80 text-white px-2 py-1 rounded-md text-xs font-semibold">
            {car.custom_id}
          </div>
        )}
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
        {car.trim && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">{t("cars_page.trim")}:</span> {car.trim}
          </p>
        )}
        {car.cylinders && (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">{t("cars_page.cylinders")}:</span> {car.cylinders}
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
        {/* New: Status display */}
        {car.status && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-semibold">{t("cars_page.status")}:</span>{" "}
            <Badge className={getStatusBadgeClasses(car.status)}>{t(`status.${car.status}`)}</Badge>
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handleViewDetails} className="w-full">
          {t("cars_page.view_details")}
        </Button>
        <Link href={`/${i18n.language}/cars/${car.id}/inquire?source=search`} className="w-full">
          <Button variant="outline" className="w-full bg-black text-white">
            {t("cars_page.inquire_now")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
