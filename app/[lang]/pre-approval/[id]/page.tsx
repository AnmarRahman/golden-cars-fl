'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { getClientI18nInstance } from '@/lib/i18n'

// Share the same form structure as /[lang]/pre-approval
import GeneralForm from '../page'

export default function CarPreApprovalPage() {
  // This component simply reuses the same layout and fields as the general form,
  // and presets the 4 vehicle fields using the selected car.
  // To avoid circular SSR imports, we replicate the general form markup here with vehicle presets.

  const params = useParams()
  const router = useRouter()
  const carId = params.id as string
  const lang = params.lang as string

  const [t, setT] = useState<(k: string) => string>(() => (k) => k)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', email: '', phone: '', dob: '', ssn: '',
    streetAddress: '', unit: '', city: '', state: '', zip: '',
    housingStatus: '', monthlyHousingPayment: '', timeAtAddressYears: '', timeAtAddressMonths: '',
    employmentStatus: '', employerName: '', jobTitle: '', employerPhone: '', monthlyIncome: '', timeAtJobYears: '', timeAtJobMonths: '', otherIncomeSource: '', otherMonthlyIncome: '',
    vehicleYear: '', vehicleMake: '', vehicleModel: '', vehicleTrim: '',
    downPayment: ''
  })

  useEffect(() => {
    (async () => {
      const i18n = await getClientI18nInstance(lang, 'translation')
      setT(() => i18n.t.bind(i18n))
    })()
  }, [lang])

  // Fetch and preset vehicle fields
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const supabase = createClientClient()
        const { data, error } = await supabase
          .from('cars')
          .select('model_year, brand, model, trim')
          .eq('id', carId)
          .single()
        if (error) throw error
        setFormData(prev => ({
          ...prev,
          vehicleYear: String(data?.model_year ?? ''),
          vehicleMake: data?.brand ?? '',
          vehicleModel: data?.model ?? '',
          vehicleTrim: data?.trim ?? ''
        }))
      } catch (e) {
        console.error(e)
      }
    }
    if (carId) fetchCar()
  }, [carId])

  const handleChange = (e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const generateReferenceNumber = () => `PRE-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-6)}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const supabase = createClientClient()
      const ref = generateReferenceNumber()
      const { error } = await supabase.from('pre_approval_applications').insert({
        reference_number: ref,
        car_id: carId,
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dob || null,
        ssn: formData.ssn,
        street_address: formData.streetAddress || null,
        unit_apt: formData.unit || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        housing_status: formData.housingStatus || null,
        monthly_housing_payment: formData.monthlyHousingPayment || null,
        time_at_address_years: formData.timeAtAddressYears || null,
        time_at_address_months: formData.timeAtAddressMonths || null,
        employment_status: formData.employmentStatus || null,
        employer_name: formData.employerName || null,
        job_title: formData.jobTitle || null,
        employer_phone: formData.employerPhone || null,
        monthly_income: formData.monthlyIncome || null,
        time_at_job_years: formData.timeAtJobYears || null,
        time_at_job_months: formData.timeAtJobMonths || null,
        other_income_source: formData.otherIncomeSource || null,
        other_monthly_income: formData.otherMonthlyIncome || null,
        vehicle_year: formData.vehicleYear || null,
        vehicle_make: formData.vehicleMake || null,
        vehicle_model: formData.vehicleModel || null,
        vehicle_trim: formData.vehicleTrim || null,
        down_payment: formData.downPayment || null,
        status: 'pending'
      })
      if (error) throw error
      setIsSubmitting(false)
      setShowLoading(true)
      setTimeout(() => router.push(`/${lang}/pre-approval/success?ref=${ref}`), 10000)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
      alert(t('pre_approval.error_description'))
    }
  }

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <div className="flex justify-center mb-6"><Loader2 className="w-16 h-16 animate-spin text-primary" /></div>
            <h2 className="text-2xl font-bold mb-4">{t('pre_approval.loading_title')}</h2>
            <p className="text-muted-foreground text-lg">{t('pre_approval.loading_message')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('pre_approval.page_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="firstName">{t('pre_approval.first_name')}</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label htmlFor="middleName">{t('pre_approval.middle_name')}</Label><Input id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="lastName">{t('pre_approval.last_name')}</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label htmlFor="email">{t('pre_approval.email')}</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label htmlFor="phone">{t('pre_approval.phone')}</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label htmlFor="dob">{t('pre_approval.date_of_birth')}</Label><Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="ssn">{t('pre_approval.ssn')}</Label><Input id="ssn" name="ssn" placeholder={t('pre_approval.ssn_placeholder')} value={formData.ssn} onChange={handleChange} required /></div>
            </div>
            {/* Address */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="streetAddress">{t('pre_approval.street_address')}</Label><Input id="streetAddress" name="streetAddress" value={formData.streetAddress} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="unit">{t('pre_approval.unit_apt')}</Label><Input id="unit" name="unit" value={formData.unit} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="city">{t('pre_approval.city')}</Label><Input id="city" name="city" value={formData.city} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="state">{t('pre_approval.state')}</Label><Input id="state" name="state" value={formData.state} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="zip">{t('pre_approval.zip')}</Label><Input id="zip" name="zip" value={formData.zip} onChange={handleChange} /></div>
              <div className="space-y-2">
                <Label htmlFor="housingStatus">{t('pre_approval.housing_status')}</Label>
                <Select onValueChange={(v) => setFormData(prev => ({ ...prev, housingStatus: v }))}>
                  <SelectTrigger id="housingStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">{t('pre_approval.housing_rent')}</SelectItem>
                    <SelectItem value="own">{t('pre_approval.housing_own')}</SelectItem>
                    <SelectItem value="living_with_family">{t('pre_approval.housing_family')}</SelectItem>
                    <SelectItem value="other">{t('pre_approval.housing_other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="monthlyHousingPayment">{t('pre_approval.monthly_housing_payment')}</Label><Input id="monthlyHousingPayment" name="monthlyHousingPayment" value={formData.monthlyHousingPayment} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="timeAtAddressYears">{t('pre_approval.time_at_address_years')}</Label><Input id="timeAtAddressYears" name="timeAtAddressYears" value={formData.timeAtAddressYears} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="timeAtAddressMonths">{t('pre_approval.time_at_address_months')}</Label><Input id="timeAtAddressMonths" name="timeAtAddressMonths" value={formData.timeAtAddressMonths} onChange={handleChange} /></div>
            </div>
            {/* Employment */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="employmentStatus">{t('pre_approval.employment_status')}</Label>
                <Select onValueChange={(v) => setFormData(prev => ({ ...prev, employmentStatus: v }))}>
                  <SelectTrigger id="employmentStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">{t('pre_approval.employed')}</SelectItem>
                    <SelectItem value="self_employed">{t('pre_approval.self_employed')}</SelectItem>
                    <SelectItem value="unemployed">{t('pre_approval.unemployed')}</SelectItem>
                    <SelectItem value="student">{t('pre_approval.student')}</SelectItem>
                    <SelectItem value="retired">{t('pre_approval.retired')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="employerName">{t('pre_approval.employer_name')}</Label><Input id="employerName" name="employerName" value={formData.employerName} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="jobTitle">{t('pre_approval.job_title')}</Label><Input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="employerPhone">{t('pre_approval.employer_phone')}</Label><Input id="employerPhone" name="employerPhone" value={formData.employerPhone} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="monthlyIncome">{t('pre_approval.monthly_income')}</Label><Input id="monthlyIncome" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="timeAtJobYears">{t('pre_approval.time_at_job_years')}</Label><Input id="timeAtJobYears" name="timeAtJobYears" value={formData.timeAtJobYears} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="timeAtJobMonths">{t('pre_approval.time_at_job_months')}</Label><Input id="timeAtJobMonths" name="timeAtJobMonths" value={formData.timeAtJobMonths} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="otherIncomeSource">{t('pre_approval.other_income_source')}</Label><Input id="otherIncomeSource" name="otherIncomeSource" value={formData.otherIncomeSource} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="otherMonthlyIncome">{t('pre_approval.other_monthly_income')}</Label><Input id="otherMonthlyIncome" name="otherMonthlyIncome" value={formData.otherMonthlyIncome} onChange={handleChange} /></div>
            </div>
            {/* Vehicle */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2"><Label htmlFor="vehicleYear">{t('pre_approval.vehicle_year')}</Label><Input id="vehicleYear" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="vehicleMake">{t('pre_approval.vehicle_make')}</Label><Input id="vehicleMake" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="vehicleModel">{t('pre_approval.vehicle_model')}</Label><Input id="vehicleModel" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="vehicleTrim">{t('pre_approval.vehicle_trim')}</Label><Input id="vehicleTrim" name="vehicleTrim" value={formData.vehicleTrim} onChange={handleChange} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="downPayment">{t('pre_approval.down_payment')}</Label><Input id="downPayment" name="downPayment" value={formData.downPayment} onChange={handleChange} /></div>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push('/cars')}>{t('pre_approval.cancel')}</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t('pre_approval.submitting') : t('pre_approval.submit_application')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
