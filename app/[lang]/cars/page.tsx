"use client" // This page needs to be a client component to manage the modal

import { createClientClient } from "@/lib/supabase/client"
import { CarCard } from "@/components/car-card"
import { SearchForm } from "@/components/search-form"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation" // Removed useRouter as modal logic is gone
import { useTranslation } from "react-i18next"

// Define the type for a car
interface Car {
  id: string
  name: string
  image_url: string[] // Changed to array of strings
  mileage: number
  vin: string
  description: string
  model_year: number
  views: number
  price: number | null // Added price
  body_style: string | null // Added body_style
  drivetrain: string | null // Added drivetrain
  brand: string | null // Added brand
  model: string | null // Added model
}

// Function to fetch cars from Supabase using the client-side client
async function getCarsClient(searchParams: {
  q?: string
  model_year?: string
  min_mileage?: string
  max_mileage?: string
  vin?: string
  price_range?: string
  body_style?: string
  drivetrain?: string
  brand?: string // Added brand
  model?: string // Added model
}): Promise<Car[]> {
  const supabase = createClientClient()
  // Corrected: Use the generic type parameter for select to specify the expected row type
  let query = supabase.from("cars").select<"*" | keyof Car, Car>("*")

  const { q, model_year, min_mileage, max_mileage, vin, price_range, body_style, drivetrain, brand, model } =
    searchParams

  if (q && typeof q === "string") {
    query = query.ilike("name", `%${q}%`)
  }
  if (model_year && typeof model_year === "string" && model_year !== "Any Year") {
    query = query.eq("model_year", Number.parseInt(model_year))
  }
  if (min_mileage && typeof min_mileage === "string") {
    query = query.gte("mileage", Number.parseInt(min_mileage))
  }
  if (max_mileage && typeof max_mileage === "string") {
    query = query.lte("mileage", Number.parseInt(max_mileage))
  }
  if (vin && typeof vin === "string") {
    query = query.ilike("vin", `%${vin}%`)
  }

  // Apply price range filter
  if (price_range) {
    switch (price_range) {
      case "under_10k":
        query = query.lte("price", 10000)
        break
      case "10k_20k":
        query = query.gte("price", 10000).lte("price", 20000)
        break
      case "20k_plus":
        query = query.gte("price", 20000)
        break
      default:
        // "any_price" or invalid value, no price filter applied
        break
    }
  }

  // Apply body style filter
  if (body_style && typeof body_style === "string" && body_style !== "any_body_style") {
    query = query.eq("body_style", body_style)
  }

  // Apply drivetrain filter
  if (drivetrain && typeof drivetrain === "string" && drivetrain !== "any_drivetrain") {
    query = query.eq("drivetrain", drivetrain)
  }

  // Apply brand filter
  if (brand && typeof brand === "string") {
    query = query.ilike("brand", `%${brand}%`)
  }

  // Apply model filter
  if (model && typeof model === "string") {
    query = query.ilike("model", `%${model}%`)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching cars:", error)
    return []
  }

  return data as Car[]
}

const CarsPage = () => {
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cars whenever search params change
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      setError(null)
      const currentParams = Object.fromEntries(searchParams.entries())
      try {
        const fetchedCars = await getCarsClient(currentParams)
        setCars(fetchedCars)
      } catch (err) {
        console.error("Failed to fetch cars:", err)
        setError(t("cars_page.failed_to_load_cars"))
      } finally {
        setLoading(false)
      }
    }
    fetchCars()
  }, [searchParams, t])

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8 text-center">{t("cars_page.title")}</h1>

      <div className="mb-12">
        <Suspense fallback={<div>{t("cars_page.loading_filters")}</div>}>
          <SearchForm initialSearchParams={Object.fromEntries(searchParams.entries())} />
        </Suspense>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground text-lg">{t("cars_page.loading_cars")}</div>
      ) : error ? (
        <div className="text-center text-destructive text-lg">{error}</div>
      ) : cars.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg">{t("cars_page.no_cars_found")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CarsPage
