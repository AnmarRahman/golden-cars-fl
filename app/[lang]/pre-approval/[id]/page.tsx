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
import { useTranslation } from 'react-i18next'

interface Car {
  id: string
  model_year: number
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
  ssn: string
  downPayment: string
  employmentStatus: string
  monthlyIncome: string
}

export default function CarPreApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
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
    ssn: '',
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
          .select('id, model_year, make, model, price, stock_number')
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

  const generateReferenceNumber = () => {
    const prefix = 'PRE'
    const randomStr = Math.random().toString(36).substring(2, 9).toUpperCase()
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}-${randomStr}-${timestamp}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const supabase = createClientClient()
      const referenceNumber = generateReferenceNumber()
      
      const { error } = await supabase
        .from('pre_approval_applications')
        .insert({
          reference_number: referenceNumber,
          car_id: parseInt(carId),
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          ssn: formData.ssn,
          down_payment: parseFloat(formData.downPayment),
          employment_status: formData.employmentStatus,
          monthly_income: parseFloat(formData.monthlyIncome),
          status: 'pending'
        })
      
      if (error) throw error
      
      const lang = params.lang as string
      
      toast({
        title: t('pre_approval.success_title'),
        description: t('pre_approval.success_description')
      })
      
      router.push(`/${lang}/pre-approval/success?ref=${referenceNumber}`)
    } catch (err) {
      console.error('Error submitting form:', err)
      toast({
        title: t('pre_approval.error_title'),
        description: t('pre_approval.error_description'),
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
            {car.model_year} {car.make} {car.model}
          </CardTitle>
          <CardDescription>
            Price: ${car.price.toLocaleString()}
            {car.stock_number && ` • Stock #${car.stock_number}`}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('pre_approval.car_title')}</CardTitle>
          <CardDescription>
            {t('pre_approval.car_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('pre_approval.first_name')}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('pre_approval.last_name')}</Label>
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
              <Label htmlFor="email">{t('pre_approval.email')}</Label>
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
              <Label htmlFor="phone">{t('pre_approval.phone')}</Label>
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
              <Label htmlFor="ssn">{t('pre_approval.ssn')}</Label>
              <Input
                id="ssn"
                name="ssn"
                type="text"
                placeholder={t('pre_approval.ssn_placeholder')}
                value={formData.ssn}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment">{t('pre_approval.down_payment')}</Label>
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
              <Label htmlFor="employmentStatus">{t('pre_approval.employment_status')}</Label>
              <select
                id="employmentStatus"
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="employed">{t('pre_approval.employed')}</option>
                <option value="self-employed">{t('pre_approval.self_employed')}</option>
                <option value="unemployed">{t('pre_approval.unemployed')}</option>
                <option value="retired">{t('pre_approval.retired')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">{t('pre_approval.monthly_income')}</Label>
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
                {submitting ? t('pre_approval.submitting') : t('pre_approval.submit_application')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/cars')}
              >
                {t('pre_approval.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}