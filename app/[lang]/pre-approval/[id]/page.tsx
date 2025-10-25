'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface Car {
  id: string
  year: number
  make: string
  model: string
  price: number
  stock_number?: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  downPayment: string
  employmentStatus: string
  monthlyIncome: string
}

export default function CarPreApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const carId = params.id as string
  
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    downPayment: '',
    employmentStatus: 'employed',
    monthlyIncome: ''
  })

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true)
        const supabase = createClientClient()
        
        const { data, error } = await supabase
          .from('cars')
          .select('id, year, make, model, price, stock_number')
          .eq('id', carId)
          .single()

        if (error) throw error
        
        if (!data) {
          setError('Car not found')
          return
        }

        setCar(data)
      } catch (err) {
        console.error('Error fetching car:', err)
        setError('Failed to load car details')
      } finally {
        setLoading(false)
      }
    }

    if (carId) {
      fetchCarDetails()
    }
  }, [carId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSubmitting(true)
  try {
    // Mock submission - log data and redirect (no backend)
    console.log('Pre-approval form submitted:', {
      ...formData,
      carId,
      car
    })
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600))
    
    const lang = params.lang as string
    
    toast({
      title: 'Success!',
      description: 'Your pre-approval request has been submitted.'
    })
    
    router.push(`/${lang}/pre-approval/success`)
  } catch (err) {
    console.error('Error submitting form:', err)
    toast({
      title: 'Error',
      description: 'Failed to submit pre-approval request. Please try again.',
      variant: 'destructive'
    })
  } finally {
    setSubmitting(false)
  }
}


  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'Car not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/cars')}>Back to Cars</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {car.year} {car.make} {car.model}
          </CardTitle>
          <CardDescription>
            Price: ${car.price.toLocaleString()}
            {car.stock_number && ` • Stock #${car.stock_number}`}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pre-Approval Application</CardTitle>
          <CardDescription>
            Complete this form to get pre-approved for financing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment ($)</Label>
              <Input
                id="downPayment"
                name="downPayment"
                type="number"
                min="0"
                step="100"
                value={formData.downPayment}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <select
                id="employmentStatus"
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="employed">Employed</option>
                <option value="self-employed">Self-Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                min="0"
                step="100"
                value={formData.monthlyIncome}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/cars')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}