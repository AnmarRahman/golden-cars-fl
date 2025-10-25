"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import { Car } from "@/types/car"
import { getCarsClient } from "@/lib/cars-api"
import CarCard from "@/components/cars/CarCard"
import SearchForm from "@/components/cars/SearchForm"

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
      
      <Link 
        href="/pre-approval"
        className="mb-6 inline-flex items-center justify-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
      >
        Get Pre-Approved
      </Link>
      
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
