'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Types
type HousingStatus = 'rent' | 'own' | 'living_with_family' | 'other'

type EmploymentStatus = 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired'

type FormValues = {
  // Personal Information
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone: string
  dob: string // YYYY-MM-DD
  ssn?: string
  driversLicenseNumber?: string
  driversLicenseState?: string
  driversLicenseExpiry?: string

  // Residential Information
  streetAddress: string
  unit?: string
  city: string
  state: string
  zip: string
  housingStatus: HousingStatus
  monthlyHousingPayment?: string
  timeAtAddressYears?: string
  timeAtAddressMonths?: string

  // Employment Information
  employmentStatus: EmploymentStatus
  employerName?: string
  jobTitle?: string
  employerPhone?: string
  monthlyIncome?: string
  timeAtJobYears?: string
  timeAtJobMonths?: string
  otherIncomeSource?: string
  otherMonthlyIncome?: string

  // Optional Vehicle Info
  vehicleYear?: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleTrim?: string
  downPayment?: string
  notes?: string
}

export default function PreApprovalPage() {
  const router = useRouter()
  const params = useParams()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      housingStatus: 'rent',
      employmentStatus: 'employed',
    },
  })

  const onSubmit = async (data: FormValues) => {
    // Mock submission: no backend call, just redirect to success page
    // Pretend to wait a bit
    await new Promise((r) => setTimeout(r, 600))
    const lang = typeof params?.lang === 'string' ? params.lang : 'en'
    router.push(`/${lang}/pre-approval/success`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Pre-Approval Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" {...register('firstName', { required: 'First name is required' })} />
                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" placeholder="A." {...register('middleName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" {...register('lastName', { required: 'Last name is required' })} />
                    {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" {...register('email', { required: 'Email is required' })} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="(555) 123-4567" {...register('phone', { required: 'Phone is required' })} />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" {...register('dob', { required: 'Date of birth is required' })} />
                    {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssn">SSN (last 4)</Label>
                    <Input id="ssn" placeholder="1234" maxLength={4} {...register('ssn')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driversLicenseNumber">Driver's License Number</Label>
                    <Input id="driversLicenseNumber" placeholder="D123-456-789-000" {...register('driversLicenseNumber')} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="driversLicenseState">DL State</Label>
                    <Input id="driversLicenseState" placeholder="FL" {...register('driversLicenseState')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driversLicenseExpiry">DL Expiry</Label>
                    <Input id="driversLicenseExpiry" type="date" {...register('driversLicenseExpiry')} />
                  </div>
                </div>
              </section>

              {/* Residential Information */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Residential Information</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="streetAddress">Street Address</Label>
                    <Input id="streetAddress" placeholder="123 Main St" {...register('streetAddress', { required: 'Street address is required' })} />
                    {errors.streetAddress && <p className="text-sm text-destructive">{errors.streetAddress.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Apt/Unit</Label>
                    <Input id="unit" placeholder="#12" {...register('unit')} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Orlando" {...register('city', { required: 'City is required' })} />
                    {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="FL" {...register('state', { required: 'State is required' })} />
                    {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input id="zip" placeholder="32801" {...register('zip', { required: 'ZIP is required' })} />
                    {errors.zip && <p className="text-sm text-destructive">{errors.zip.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Housing Status</Label>
                    <Select onValueChange={(v) => setValue('housingStatus', v as HousingStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="own">Own</SelectItem>
                        <SelectItem value="living_with_family">Living with family</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyHousingPayment">Monthly Housing Payment</Label>
                    <Input id="monthlyHousingPayment" placeholder="$1,200" {...register('monthlyHousingPayment')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeAtAddressYears">Years at Address</Label>
                      <Input id="timeAtAddressYears" placeholder="2" {...register('timeAtAddressYears')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeAtAddressMonths">Months</Label>
                      <Input id="timeAtAddressMonths" placeholder="6" {...register('timeAtAddressMonths')} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Employment Information */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Employment Information</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Employment Status</Label>
                    <Select onValueChange={(v) => setValue('employmentStatus', v as EmploymentStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self_employed">Self-employed</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employerName">Employer Name</Label>
                    <Input id="employerName" placeholder="Acme Corp" {...register('employerName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" placeholder="Sales Associate" {...register('jobTitle')} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="employerPhone">Employer Phone</Label>
                    <Input id="employerPhone" placeholder="(555) 987-6543" {...register('employerPhone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income (before taxes)</Label>
                    <Input id="monthlyIncome" placeholder="$4,200" {...register('monthlyIncome')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeAtJobYears">Years at Job</Label>
                      <Input id="timeAtJobYears" placeholder="3" {...register('timeAtJobYears')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeAtJobMonths">Months</Label>
                      <Input id="timeAtJobMonths" placeholder="2" {...register('timeAtJobMonths')} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="otherIncomeSource">Other Income Source</Label>
                    <Input id="otherIncomeSource" placeholder="Part-time, SSI, etc." {...register('otherIncomeSource')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherMonthlyIncome">Other Monthly Income</Label>
                    <Input id="otherMonthlyIncome" placeholder="$500" {...register('otherMonthlyIncome')} />
                  </div>
                </div>
              </section>

              {/* Optional Vehicle Information */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Optional Vehicle Information</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleYear">Year</Label>
                    <Input id="vehicleYear" placeholder="2021" {...register('vehicleYear')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Make</Label>
                    <Input id="vehicleMake" placeholder="Toyota" {...register('vehicleMake')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Model</Label>
                    <Input id="vehicleModel" placeholder="Camry" {...register('vehicleModel')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleTrim">Trim</Label>
                    <Input id="vehicleTrim" placeholder="XSE" {...register('vehicleTrim')} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="downPayment">Down Payment</Label>
                    <Input id="downPayment" placeholder="$2,000" {...register('downPayment')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Anything else you'd like us to know" {...register('notes')} />
                </div>
              </section>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
