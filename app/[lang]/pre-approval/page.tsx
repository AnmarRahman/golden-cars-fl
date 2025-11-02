'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { getClientI18nInstance } from '@/lib/i18n'

// Shared types
type HousingStatus = 'rent' | 'own' | 'living_with_family' | 'other'
type EmploymentStatus = 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired'

type FormValues = {
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
  housingStatus: HousingStatus
  monthlyHousingPayment?: string
  timeAtAddressYears?: string
  timeAtAddressMonths?: string
  employmentStatus: EmploymentStatus
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

export default function PreApprovalPage() {
  const router = useRouter()
  const { lang } = useParams() as { lang: string }
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [t, setT] = useState<(k: string) => string>(() => (k) => k)

  useEffect(() => {
    (async () => {
      const i18n = await getClientI18nInstance(lang, 'translation')
      setT(() => i18n.t.bind(i18n))
    })()
  }, [lang])

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      const res = await fetch('/api/pre-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_number: `PRE-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-6)}`,
          first_name: data.firstName,
          middle_name: data.middleName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.dob,
          ssn: data.ssn,
          street_address: data.streetAddress,
          unit_apt: data.unit,
          city: data.city,
          state: data.state,
          zip: data.zip,
          housing_status: data.housingStatus,
          monthly_housing_payment: data.monthlyHousingPayment,
          time_at_address_years: data.timeAtAddressYears,
          time_at_address_months: data.timeAtAddressMonths,
          employment_status: data.employmentStatus,
          employer_name: data.employerName,
          job_title: data.jobTitle,
          employer_phone: data.employerPhone,
          monthly_income: data.monthlyIncome,
          time_at_job_years: data.timeAtJobYears,
          time_at_job_months: data.timeAtJobMonths,
          other_income_source: data.otherIncomeSource,
          other_monthly_income: data.otherMonthlyIncome,
          vehicle_year: data.vehicleYear,
          vehicle_make: data.vehicleMake,
          vehicle_model: data.vehicleModel,
          vehicle_trim: data.vehicleTrim,
          down_payment: data.downPayment,
          status: 'pending'
        })
      })
      if (!res.ok) throw new Error('Failed to submit application')
      const result = await res.json()
      setIsSubmitting(false)
      setShowLoading(true)
      setTimeout(() => {
        reset()
        router.push(`/${lang}/pre-approval/success?ref=${result.reference_number}`)
      }, 10000)
    } catch (e) {
      console.error(e)
      setIsSubmitting(false)
      alert(t('pre_approval.error_description'))
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

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('pre_approval.page_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* personal */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="firstName">{t('pre_approval.first_name')}</Label><Input id="firstName" {...register('firstName', { required: true })} /></div>
              <div className="space-y-2"><Label htmlFor="middleName">{t('pre_approval.middle_name')}</Label><Input id="middleName" {...register('middleName')} /></div>
              <div className="space-y-2"><Label htmlFor="lastName">{t('pre_approval.last_name')}</Label><Input id="lastName" {...register('lastName', { required: true })} /></div>
              <div className="space-y-2"><Label htmlFor="email">{t('pre_approval.email')}</Label><Input id="email" type="email" {...register('email', { required: true })} /></div>
              <div className="space-y-2"><Label htmlFor="phone">{t('pre_approval.phone')}</Label><Input id="phone" {...register('phone', { required: true })} /></div>
              <div className="space-y-2"><Label htmlFor="dob">{t('pre_approval.date_of_birth')}</Label><Input id="dob" type="date" {...register('dob')} /></div>
              <div className="space-y-2"><Label htmlFor="ssn">{t('pre_approval.ssn')}</Label><Input id="ssn" placeholder={t('pre_approval.ssn_placeholder')} {...register('ssn', { required: true })} /></div>
            </div>
            {/* address */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="streetAddress">{t('pre_approval.street_address')}</Label><Input id="streetAddress" {...register('streetAddress')} /></div>
              <div className="space-y-2"><Label htmlFor="unit">{t('pre_approval.unit_apt')}</Label><Input id="unit" {...register('unit')} /></div>
              <div className="space-y-2"><Label htmlFor="city">{t('pre_approval.city')}</Label><Input id="city" {...register('city')} /></div>
              <div className="space-y-2"><Label htmlFor="state">{t('pre_approval.state')}</Label><Input id="state" {...register('state')} /></div>
              <div className="space-y-2"><Label htmlFor="zip">{t('pre_approval.zip')}</Label><Input id="zip" {...register('zip')} /></div>
              <div className="space-y-2"><Label htmlFor="housingStatus">{t('pre_approval.housing_status')}</Label>
                <Select onValueChange={(v) => setValue('housingStatus', v as HousingStatus)}>
                  <SelectTrigger id="housingStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">{t('pre_approval.housing_rent')}</SelectItem>
                    <SelectItem value="own">{t('pre_approval.housing_own')}</SelectItem>
                    <SelectItem value="living_with_family">{t('pre_approval.housing_family')}</SelectItem>
                    <SelectItem value="other">{t('pre_approval.housing_other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="monthlyHousingPayment">{t('pre_approval.monthly_housing_payment')}</Label><Input id="monthlyHousingPayment" {...register('monthlyHousingPayment')} /></div>
              <div className="space-y-2"><Label htmlFor="timeAtAddressYears">{t('pre_approval.time_at_address_years')}</Label><Input id="timeAtAddressYears" {...register('timeAtAddressYears')} /></div>
              <div className="space-y-2"><Label htmlFor="timeAtAddressMonths">{t('pre_approval.time_at_address_months')}</Label><Input id="timeAtAddressMonths" {...register('timeAtAddressMonths')} /></div>
            </div>
            {/* employment */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="employmentStatus">{t('pre_approval.employment_status')}</Label>
                <Select onValueChange={(v) => setValue('employmentStatus', v as EmploymentStatus)}>
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
              <div className="space-y-2"><Label htmlFor="employerName">{t('pre_approval.employer_name')}</Label><Input id="employerName" {...register('employerName')} /></div>
              <div className="space-y-2"><Label htmlFor="jobTitle">{t('pre_approval.job_title')}</Label><Input id="jobTitle" {...register('jobTitle')} /></div>
              <div className="space-y-2"><Label htmlFor="employerPhone">{t('pre_approval.employer_phone')}</Label><Input id="employerPhone" {...register('employerPhone')} /></div>
              <div className="space-y-2"><Label htmlFor="monthlyIncome">{t('pre_approval.monthly_income')}</Label><Input id="monthlyIncome" {...register('monthlyIncome')} /></div>
              <div className="space-y-2"><Label htmlFor="timeAtJobYears">{t('pre_approval.time_at_job_years')}</Label><Input id="timeAtJobYears" {...register('timeAtJobYears')} /></div>
              <div className="space-y-2"><Label htmlFor="timeAtJobMonths">{t('pre_approval.time_at_job_months')}</Label><Input id="timeAtJobMonths" {...register('timeAtJobMonths')} /></div>
              <div className="space-y-2"><Label htmlFor="otherIncomeSource">{t('pre_approval.other_income_source')}</Label><Input id="otherIncomeSource" {...register('otherIncomeSource')} /></div>
              <div className="space-y-2"><Label htmlFor="otherMonthlyIncome">{t('pre_approval.other_monthly_income')}</Label><Input id="otherMonthlyIncome" {...register('otherMonthlyIncome')} /></div>
            </div>
            {/* vehicle */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2"><Label htmlFor="vehicleYear">{t('pre_approval.vehicle_year')}</Label><Input id="vehicleYear" {...register('vehicleYear')} /></div>
              <div className="space-y-2"><Label htmlFor="vehicleMake">{t('pre_approval.vehicle_make')}</Label><Input id="vehicleMake" {...register('vehicleMake')} /></div>
              <div className="space-y-2"><Label htmlFor="vehicleModel">{t('pre_approval.vehicle_model')}</Label><Input id="vehicleModel" {...register('vehicleModel')} /></div>
              <div className="space-y-2"><Label htmlFor="vehicleTrim">{t('pre_approval.vehicle_trim')}</Label><Input id="vehicleTrim" {...register('vehicleTrim')} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="downPayment">{t('pre_approval.down_payment')}</Label><Input id="downPayment" {...register('downPayment')} /></div>
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
