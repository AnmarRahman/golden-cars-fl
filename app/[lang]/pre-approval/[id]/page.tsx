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
import { Loader2 } from 'lucide-react'
import { getClientI18nInstance } from '@/lib/i18n'

// Keep the FormValues in sync with the general form
interface FormValues {
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  dob: string
  ssn: string
  streetAddress: string
  unit?: string
  city: string
  state: string
  zip: string
  housingStatus?: string
  monthlyHousingPayment?: string
  timeAtAddressYears?: string
  timeAtAddressMonths?: string
  employmentStatus?: string
  employerName?: string
  jobTitle?: string
  employerPhone?: string
  monthlyIncome?: string
  timeAtJobYears?: string
  timeAtJobMonths?: string
  otherIncomeSource?: string
  otherMonthlyIncome?: string
  vehicleYear?: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleTrim?: string
  downPayment?: string
}

interface Car {
  id: string
  model_year: number
  brand: string
  model: string
  trim: string | null
  price: number | null
  vin: string | null
  custom_id: string | null
}

export default function CarPreApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const carId = params.id as string
  const lang = params.lang as string

  const [t, setT] = useState<(k: string) => string>(() => (k) => k)
  useEffect(() => {
    (async () => {
      const i18n = await getClientI18nInstance(lang, 'translation')
      setT(() => i18n.t.bind(i18n))
    })()
  }, [lang])

  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  const [formData, setFormData] = useState<FormValues>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    ssn: '',
    streetAddress: '',
    unit: '',
    city: '',
    state: '',
    zip: '',
    housingStatus: '',
    monthlyHousingPayment: '',
    timeAtAddressYears: '',
    timeAtAddressMonths: '',
    employmentStatus: '',
    employerName: '',
    jobTitle: '',
    employerPhone: '',
    monthlyIncome: '',
    timeAtJobYears: '',
    timeAtJobMonths: '',
    otherIncomeSource: '',
    otherMonthlyIncome: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleTrim: '',
    downPayment: ''
  })

  // Fetch car and preset vehicle fields
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true)
        const supabase = createClientClient()
        const { data, error } = await supabase
          .from('cars')
          .select('id, model_year, brand, model, trim, price, vin, custom_id')
          .eq('id', carId)
          .single()
        if (error) throw error
        setCar(data as Car)
        setFormData(prev => ({
          ...prev,
          vehicleYear: String(data?.model_year ?? ''),
          vehicleMake: data?.brand ?? '',
          vehicleModel: data?.model ?? '',
          vehicleTrim: data?.trim ?? ''
        }))
      } catch (err) {
        console.error('Error fetching car:', err)
        setError('Failed to load car details')
      } finally {
        setLoading(false)
      }
    }
    if (carId) fetchCarDetails()
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
    setIsSubmitting(true)
    try {
      const referenceNumber = generateReferenceNumber()
      const supabase = createClientClient()
      const { error } = await supabase
        .from('pre_approval_applications')
        .insert({
          reference_number: referenceNumber,
          car_id: carId,
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.dob,
          ssn: formData.ssn,
          street_address: formData.streetAddress,
          unit_apt: formData.unit,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          housing_status: formData.housingStatus,
          monthly_housing_payment: formData.monthlyHousingPayment,
          time_at_address_years: formData.timeAtAddressYears,
          time_at_address_months: formData.timeAtAddressMonths,
          employment_status: formData.employmentStatus,
          employer_name: formData.employerName,
          job_title: formData.jobTitle,
          employer_phone: formData.employerPhone,
          monthly_income: formData.monthlyIncome,
          time_at_job_years: formData.timeAtJobYears,
          time_at_job_months: formData.timeAtJobMonths,
          other_income_source: formData.otherIncomeSource,
          other_monthly_income: formData.otherMonthlyIncome,
          vehicle_year: formData.vehicleYear,
          vehicle_make: formData.vehicleMake,
          vehicle_model: formData.vehicleModel,
          vehicle_trim: formData.vehicleTrim,
          down_payment: formData.downPayment,
          status: 'pending'
        })
      if (error) throw error

      // Match general form: show loading then redirect
      setIsSubmitting(false)
      setShowLoading(true)
      setTimeout(() => {
        toast({ title: t('pre_approval.success_title') })
        router.push(`/${lang}/pre-approval/success?ref=${referenceNumber}`)
      }, 10000)
    } catch (err) {
      console.error('Error submitting form:', err)
      setIsSubmitting(false)
      toast({ title: t('pre_approval.error_title'), description: t('pre_approval.error_description'), variant: 'destructive' })
    }
  }

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">{t('pre_approval.loading_title')}</h2>
            <p className="text-muted-foreground text-lg">{t('pre_approval.loading_message')}</p>
          </CardContent>
        </Card>
      </div>
    )
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
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {car.model_year} {car.brand} {car.model}{car.trim ? ` ${car.trim}` : ''}
          </CardTitle>
          <CardDescription>
            {car.vin ? `VIN: ${car.vin} • ` : ''}{car.custom_id ? car.custom_id + ' • ' : ''}{car.price ? `$${Number(car.price).toLocaleString()}` : 'Call for Price'}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('pre_approval.car_title')}</CardTitle>
          <CardDescription>{t('pre_approval.car_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal */}
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('pre_approval.first_name')}</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">{t('pre_approval.middle_name')}</Label>
              <Input id="middleName" name="middleName" value={formData.middleName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('pre_approval.last_name')}</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">{t('pre_approval.date_of_birth')}</Label>
              <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('pre_approval.email')}</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('pre_approval.phone')}</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="streetAddress">{t('pre_approval.street_address')}</Label>
              <Input id="streetAddress" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">{t('pre_approval.unit_apt')}</Label>
              <Input id="unit" name="unit" value={formData.unit} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t('pre_approval.city')}</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">{t('pre_approval.state')}</Label>
              <Input id="state" name="state" value={formData.state} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">{t('pre_approval.zip')}</Label>
              <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} />
            </div>

            {/* Housing */}
            <div className="space-y-2">
              <Label htmlFor="housingStatus">{t('pre_approval.housing_status')}</Label>
              <Input id="housingStatus" name="housingStatus" value={formData.housingStatus} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyHousingPayment">{t('pre_approval.monthly_housing_payment')}</Label>
              <Input id="monthlyHousingPayment" name="monthlyHousingPayment" value={formData.monthlyHousingPayment} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeAtAddressYears">{t('pre_approval.time_at_address_years')}</Label>
              <Input id="timeAtAddressYears" name="timeAtAddressYears" value={formData.timeAtAddressYears} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeAtAddressMonths">{t('pre_approval.time_at_address_months')}</Label>
              <Input id="timeAtAddressMonths" name="timeAtAddressMonths" value={formData.timeAtAddressMonths} onChange={handleInputChange} />
            </div>

            {/* Employment */}
            <div className="space-y-2">
              <Label htmlFor="employmentStatus">{t('pre_approval.employment_status')}</Label>
              <Input id="employmentStatus" name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employerName">{t('pre_approval.employer_name')}</Label>
              <Input id="employerName" name="employerName" value={formData.employerName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">{t('pre_approval.job_title')}</Label>
              <Input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employerPhone">{t('pre_approval.employer_phone')}</Label>
              <Input id="employerPhone" name="employerPhone" value={formData.employerPhone} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">{t('pre_approval.monthly_income')}</Label>
              <Input id="monthlyIncome" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeAtJobYears">{t('pre_approval.time_at_job_years')}</Label>
              <Input id="timeAtJobYears" name="timeAtJobYears" value={formData.timeAtJobYears} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeAtJobMonths">{t('pre_approval.time_at_job_months')}</Label>
              <Input id="timeAtJobMonths" name="timeAtJobMonths" value={formData.timeAtJobMonths} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherIncomeSource">{t('pre_approval.other_income_source')}</Label>
              <Input id="otherIncomeSource" name="otherIncomeSource" value={formData.otherIncomeSource} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherMonthlyIncome">{t('pre_approval.other_monthly_income')}</Label>
              <Input id="otherMonthlyIncome" name="otherMonthlyIncome" value={formData.otherMonthlyIncome} onChange={handleInputChange} />
            </div>

            {/* Vehicle */}
            <div className="space-y-2">
              <Label htmlFor="vehicleYear">{t('pre_approval.vehicle_year')}</Label>
              <Input id="vehicleYear" name="vehicleYear" value={formData.vehicleYear} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleMake">{t('pre_approval.vehicle_make')}</Label>
              <Input id="vehicleMake" name="vehicleMake" value={formData.vehicleMake} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleModel">{t('pre_approval.vehicle_model')}</Label>
              <Input id="vehicleModel" name="vehicleModel" value={formData.vehicleModel} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleTrim">{t('pre_approval.vehicle_trim')}</Label>
              <Input id="vehicleTrim" name="vehicleTrim" value={formData.vehicleTrim} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="downPayment">{t('pre_approval.down_payment')}</Label>
              <Input id="downPayment" name="downPayment" value={formData.downPayment} onChange={handleInputChange} />
            </div>

            <div className="md:col-span-2 flex gap-4 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? t('pre_approval.submitting') : t('pre_approval.submit_application')}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/cars')}>
                {t('pre_approval.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
