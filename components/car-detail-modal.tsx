"use client"

import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react" // Import Chevron icons
import { useEffect, useState } from "react"
import { createClientClient } from "@/lib/supabase/client"
import { useTranslation } from "react-i18next"
import { incrementCarView } from "@/actions/car-views"
import { useParams } from "next/navigation"

interface Car {
  id: string
  name: string
  image_url: string[] // Changed to array of strings
  mileage: number
  vin: string
  description: string
  model_year: number
  views: number
  price: number | null
}

interface CarDetailModalProps {
  carId: string | null
  onClose: () => void
}

export function CarDetailModal({ carId, onClose }: CarDetailModalProps) {
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // New state for image index
  const supabase = createClientClient()
  const { t, i18n } = useTranslation()
  const params = useParams()
  const lang = params.lang as string

  console.log("CarDetailModal: Received carId prop:", carId, "Type:", typeof carId)

  useEffect(() => {
    async function fetchCarDetails() {
      console.log("CarDetailModal: useEffect triggered. carId value inside effect:", carId, "Type:", typeof carId)

      // Explicitly check for null, undefined, empty string, or the string "undefined"
      if (
        carId === null ||
        carId === undefined ||
        typeof carId !== "string" ||
        carId.length === 0 ||
        carId === "undefined"
      ) {
        setCar(null)
        setLoading(false)
        console.log(
          "CarDetailModal: carId is not a valid string (null, undefined, empty, or 'undefined' string), returning. Current carId:",
          carId,
        )
        return
      }

      // Add a trace to see the call stack when the query is about to be made
      console.trace("CarDetailModal: About to fetch car details for ID:", carId)

      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase.from("cars").select("*").eq("id", carId).single<Car>()

        if (error) {
          console.error("CarDetailModal: Error fetching car details:", error)
          setError(t("car_detail_modal.failed_to_load"))
          setCar(null)
        } else {
          console.log("CarDetailModal: Successfully fetched car data:", data)
          setCar(data)
          setCurrentImageIndex(0) // Reset image index when new car is loaded
          if (data) {
            await incrementCarView(data.id, lang)
          }
        }
      } catch (e) {
        console.error("CarDetailModal: Unexpected error during fetch:", e)
        setError("An unexpected error occurred while loading car details.")
        setCar(null)
      } finally {
        setLoading(false)
        console.log("CarDetailModal: Fetch complete, setting loading to false.")
      }
    }

    fetchCarDetails()
  }, [carId, supabase, t, lang])

  const handleNextImage = () => {
    if (car && car.image_url && car.image_url.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % car.image_url.length)
    }
  }

  const handlePrevImage = () => {
    if (car && car.image_url && car.image_url.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + car.image_url.length) % car.image_url.length)
    }
  }

  return (
    <Dialog open={!!carId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">{car?.name || t("car_detail_modal.car_details")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {car?.model_year ? `${t("cars_page.year")}: ${car.model_year}` : ""}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-6 text-center">{t("car_detail_modal.loading_details")}</div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : car ? (
          <div className="grid md:grid-cols-2 gap-6 p-6 pt-0">
            <div className="relative h-64 w-full rounded-lg overflow-hidden">
              <Image
                src={car.image_url[currentImageIndex] || "/placeholder.svg?height=400&width=600"}
                alt={car.name}
                fill
                className="object-cover object-center"
              />
              {car.image_url && car.image_url.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Previous image</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                    <span className="sr-only">Next image</span>
                  </Button>
                </>
              )}
            </div>
            <div className="space-y-4">
              <p className="text-3xl font-bold text-primary">
                {car.price !== null ? `$${car.price.toLocaleString()}` : t("cars_page.call_for_price")}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">{t("cars_page.mileage")}:</span> {car.mileage.toLocaleString()} miles
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">{t("cars_page.vin")}:</span> {car.vin}
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">{t("car_detail_modal.description")}:</p>
                <p className="text-muted-foreground">{car.description}</p>
              </div>
              <Link href={`/${i18n.language}/cars/${car.id}/inquire`}>
                <Button className="w-full">{t("cars_page.inquire_now")}</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">{t("car_detail_modal.not_available")}</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
