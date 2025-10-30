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
  brand: string
  model: string
  trim: string | null
  price: number | null
  vin: string | null
  custom_id: string | null
}

interface FormData {
  firstName: string
  middleName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  streetAddress: string
  unitApt: string
  city: string
  state: string
  zip: string
  housingStatus: string
  monthlyHousingPayment: string
  timeAtAddressYears: string
  timeAtAddressMonths: string
  employmentStatus: string
  employerName: string
  jobTitle: string
  employerPhone: string
  timeAtJobYears: string
  timeAtJobMonths: string
  monthlyIncome: string
  otherIncomeSource: string
  otherMonthlyIncome: string
  vehicleYear: string
  vehicleMake: string
  vehicleModel: string
  vehicleTrim: string
  downPayment: string
  ssn: string
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
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    streetAddress: '',
    unitApt: '',
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
    timeAtJobYears: '',
    timeAtJobMonths: '',
    monthlyIncome: '',
    otherIncomeSource: '',
    otherMonthlyIncome: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleTrim: '',
    downPayment: '',
    ssn: ''
  })

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
    setSubmitting(true)
    try {
      const supabase = createClientClient()
      const referenceNumber = generateReferenceNumber()
      const { error } = await supabase
        .from('pre_approval_applications')
        .insert({
          reference_number: referenceNumber,
          car_id: carId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          ssn: formData.ssn,
          down_payment: parseFloat(formData.downPayment || '0'),
          employment_status: formData.employmentStatus,
          monthly_income: parseFloat(formData.monthlyIncome || '0'),
          status: 'pending',
          middle_name: formData.middleName,
          date_of_birth: formData.dateOfBirth,
          street_address: formData.streetAddress,
          unit_apt: formData.unitApt,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          housing_status: formData.housingStatus,
          monthly_housing_payment: parseFloat(formData.monthlyHousingPayment.replace(/[^0-9.]/g, '') || '0'),
          time_at_address_years: formData.timeAtAddressYears,
          time_at_address_months: formData.timeAtAddressMonths,
          employer_name: formData.employerName,
          job_title: formData.jobTitle,
          employer_phone: formData.employerPhone,
          time_at_job_years: formData.timeAtJobYears,
          time_at_job_months: formData.timeAtJobMonths,
          other_income_source: formData.otherIncomeSource,
          other_monthly_income: parseFloat(formData.otherMonthlyIncome.replace(/[^0-9.]/g, '') || '0'),
          vehicle_year: formData.vehicleYear,
          vehicle_make: formData.vehicleMake,
          vehicle_model: formData.vehicleModel,
          vehicle_trim: formData.vehicleTrim
        })
      if (error) throw error
      const lang = params.lang as string
      toast({ title: t('pre_approval.success_title'), description: t('pre_approval.success_description') })
      router.push(`/${lang}/pre-approval/success?ref=${referenceNumber}`)
    } catch (err) {
      console.error('Error submitting form:', err)
      toast({ title: t('pre_approval.error_title'), description: t('pre_approval.error_description'), variant: 'destructive' })
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
          <CardTitle>Pre-Approval Application</CardTitle>
          <CardDescription>Complete this form to get pre-approved for financing this vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input id="middleName" name="middleName" value={formData.middleName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input id="streetAddress" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitApt">Unit/Apt</Label>
              <Input id="unitApt" name="unitApt" value={formData.unitApt} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" value={formData.state} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="housingStatus">Housing Status</Label>
              <Input id="housingStatus" name="housingStatus" value={formData.housingStatus} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyHousingPayment">Monthly Housing Payment</Label>
              <Input id="monthlyHousingPayment" name="monthlyHousingPayment" value={formData.monthlyHousingPayment} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeAtAddressYears">Time at Address (Years)</Label>
              <Input id="timeAtAddressYears" name="timeAtAddressYears" value={formData.timeAtAddressYears} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeAtAddressMonths">Time at Address (Months)</Label>
              <Input id="timeAtAddressMonths" name="timeAtAddressMonths" value={formData.timeAtAddressMonths} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Input id="employmentStatus" name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employerName">Employer Name</Label>
              <Input id="employerName" name="employerName" value={formData.employerName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employerPhone">Employer Phone</Label>
              <Input id="employerPhone" name="employerPhone" value={formData.employerPhone} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeAtJobYears">Time at Job (Years)</Label>
              <Input id="timeAtJobYears" name="timeAtJobYears" value={formData.timeAtJobYears} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeAtJobMonths">Time at Job (Months)</Label>
              <Input id="timeAtJobMonths" name="timeAtJobMonths" value={formData.timeAtJobMonths} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income</Label>
              <Input id="monthlyIncome" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherIncomeSource">Other Income Source</Label>
              <Input id="otherIncomeSource" name="otherIncomeSource" value={formData.otherIncomeSource} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherMonthlyIncome">Other Monthly Income</Label>
              <Input id="otherMonthlyIncome" name="otherMonthlyIncome" value={formData.otherMonthlyIncome} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleYear">Vehicle Year</Label>
              <Input id="vehicleYear" name="vehicleYear" value={formData.vehicleYear} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleMake">Make</Label>
              <Input id="vehicleMake" name="vehicleMake" value={formData.vehicleMake} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Model</Label>
              <Input id="vehicleModel" name="vehicleModel" value={formData.vehicleModel} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleTrim">Trim</Label>
              <Input id="vehicleTrim" name="vehicleTrim" value={formData.vehicleTrim} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssn">Social Security Number</Label>
              <Input id="ssn" name="ssn" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment ($)</Label>
              <Input id="downPayment" name="downPayment" value={formData.downPayment} onChange={handleInputChange} />
            </div>
            <div className="md:col-span-2 flex gap-4 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/cars')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
