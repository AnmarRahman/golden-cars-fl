"use client" // This page needs to be a client component for image carousel and back button

import { createClientClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { incrementCarView } from "@/actions/car-views"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

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

export default function CarDetailPage() {
    const params = useParams()
    const router = useRouter()
    const carId = params.id as string
    const lang = params.lang as string
    const { t, i18n } = useTranslation()

    const [car, setCar] = useState<Car | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const supabase = createClientClient()

    // Ref to track if view has been incremented for this component instance
    // This helps prevent double-counting in React Strict Mode (development).
    const hasViewIncremented = useRef(false)

    // Effect for fetching car details
    useEffect(() => {
        async function fetchCarDetails() {
            setLoading(true)
            setError(null)

            try {
                const { data, error } = await supabase.from("cars").select("*").eq("id", carId).single<Car>()

                if (error) {
                    console.error("Error fetching car details:", error)
                    setError(t("car_detail_page.failed_to_load"))
                    setCar(null)
                } else {
                    setCar(data)
                    setCurrentImageIndex(0) // Reset image index when new car is loaded
                }
            } catch (e) {
                console.error("Unexpected error during fetch:", e)
                setError("An unexpected error occurred while loading car details.")
                setCar(null)
            } finally {
                setLoading(false)
            }
        }

        if (carId) {
            fetchCarDetails()
        } else {
            setLoading(false)
            setError(t("car_detail_page.not_available"))
        }
    }, [carId, supabase, t, lang])

    // Effect for incrementing views - runs only once per carId change
    // In React Strict Mode (development), effects run twice on mount.
    // The `hasViewIncremented` ref helps prevent the action from being called twice.
    useEffect(() => {
        if (carId && !hasViewIncremented.current) {
            incrementCarView(carId, lang)
            hasViewIncremented.current = true
        }

        // Cleanup function for Strict Mode:
        // When the component unmounts (or re-mounts in Strict Mode),
        // reset the ref so that if the component is re-mounted later,
        // the view can be incremented again.
        return () => {
            hasViewIncremented.current = false
        }
    }, [carId, lang]) // Dependencies: carId and lang to re-run if these change

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

    if (loading) {
        return (
            <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 text-center bg-background text-foreground">
                <p className="text-lg text-muted-foreground">{t("car_detail_page.loading_details")}</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 text-center bg-background text-foreground">
                <h1 className="text-3xl font-bold mb-4 text-destructive">{error}</h1>
                <Button onClick={() => router.back()}>{t("car_detail_page.back_to_search_results")}</Button>
            </div>
        )
    }

    if (!car) {
        return (
            <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 text-center bg-background text-foreground">
                <h1 className="text-3xl font-bold mb-4">{t("car_detail_page.not_available")}</h1>
                <Button onClick={() => router.back()}>{t("car_detail_page.back_to_search_results")}</Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 bg-background text-foreground">
            <div className="flex items-center justify-between mb-8">
                <Button onClick={() => router.back()} variant="outline">
                    {t("car_detail_page.back_to_search_results")}
                </Button>
                <h1 className="text-4xl font-bold text-center flex-grow">{car.name}</h1>
                <div className="w-24"></div> {/* Spacer to balance the back button */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg">
                    <Image
                        src={car.image_url[currentImageIndex] || "/placeholder.svg?height=600&width=800"}
                        alt={car.name}
                        fill
                        className="object-cover object-center"
                    />
                    {car.image_url && car.image_url.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10"
                                onClick={handlePrevImage}
                            >
                                <ChevronLeft className="h-6 w-6" />
                                <span className="sr-only">Previous image</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10"
                                onClick={handleNextImage}
                            >
                                <ChevronRight className="h-6 w-6" />
                                <span className="sr-only">Next image</span>
                            </Button>
                        </>
                    )}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                        {car.image_url.map((_, index) => (
                            <span
                                key={index}
                                className={`h-2 w-2 rounded-full ${index === currentImageIndex ? "bg-primary" : "bg-gray-400"
                                    } cursor-pointer`}
                                onClick={() => setCurrentImageIndex(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Car Details */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-primary">
                        {car.price !== null ? `$${car.price.toLocaleString()}` : t("cars_page.call_for_price")}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-lg">
                        <p>
                            <span className="font-semibold">{t("cars_page.year")}:</span> {car.model_year}
                        </p>
                        <p>
                            <span className="font-semibold">{t("cars_page.mileage")}:</span> {car.mileage.toLocaleString()} miles
                        </p>
                        {car.brand && (
                            <p>
                                <span className="font-semibold">{t("cars_page.brand")}:</span> {car.brand}
                            </p>
                        )}
                        {car.model && (
                            <p>
                                <span className="font-semibold">{t("cars_page.model")}:</span> {car.model}
                            </p>
                        )}
                        {car.body_style && (
                            <p>
                                <span className="font-semibold">{t("cars_page.body_style")}:</span>{" "}
                                {t(`search_form.${car.body_style.toLowerCase()}`)}
                            </p>
                        )}
                        {car.drivetrain && (
                            <p>
                                <span className="font-semibold">{t("cars_page.drivetrain")}:</span>{" "}
                                {t(`search_form.${car.drivetrain.toLowerCase()}`)}
                            </p>
                        )}
                        <p>
                            <span className="font-semibold">{t("cars_page.vin")}:</span> {car.vin}
                        </p>
                        {/* Add more details here as needed */}
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-xl text-foreground">{t("car_detail_page.description")}:</h3>
                        <p className="text-muted-foreground">{car.description}</p>
                    </div>
                    <Link href={`/${i18n.language}/cars/${car.id}/inquire?source=detail`} className="block">
                        <Button className="w-full py-3 text-lg">{t("cars_page.inquire_now")}</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
