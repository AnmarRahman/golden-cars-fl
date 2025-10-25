'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PreApprovalForm from '@/components/PreApprovalForm'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Car {
  id: string
  year: number
  make: string
  model: string
  price: number
  stock_number?: string
}

export default function CarPreApprovalPage() {
  const params = useParams()
  const carId = params.id as string
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true)
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('cars')
          .select('id, year, make, model, price, stock_number')
          .eq('id', carId)
          .single()

        if (error) {
          console.error('Error fetching car:', error)
          setError('Failed to load car details')
        } else {
          setCar(data)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (carId) {
      fetchCarDetails()
    }
  }, [carId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Vehicle
            </h1>
            <p className="text-gray-600">
              {error || 'Vehicle not found. Please try again or contact support.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pre-fill vehicle information for the form
  const preFilledData = {
    vehicleYear: car.year.toString(),
    vehicleMake: car.make,
    vehicleModel: car.model,
    vehiclePrice: car.price.toString(),
    stockNumber: car.stock_number || ''
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Pre-Approval Application
        </h1>
        <p className="text-gray-600">
          Applying for: {car.year} {car.make} {car.model} - ${car.price.toLocaleString()}
        </p>
        {car.stock_number && (
          <p className="text-sm text-gray-500">
            Stock #: {car.stock_number}
          </p>
        )}
      </div>
      
      <PreApprovalForm preFilledVehicleData={preFilledData} />
    </div>
  )
}
