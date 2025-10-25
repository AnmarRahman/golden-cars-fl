'use client'
import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
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
}

export default function PreApprovalPage() {
  const router = useRouter()
  const { lang } = useParams() as { lang: string }
  const { register, handleSubmit } = useForm<FormValues>()

  const onSubmit = (data: FormValues) => {
    console.log('Pre-approval form submitted', data)
    router.push(`/${lang}/pre-approval/confirm`)
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Pre-Approval Application</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" {...register('firstName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" placeholder="A." {...register('middleName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" {...register('lastName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john.doe@email.com" {...register('email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="(555) 555-5555" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" {...register('dob')} />
              </div>
            </div>

            {/* Residential Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input id="streetAddress" placeholder="123 Main St" {...register('streetAddress')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit/Apt</Label>
                <Input id="unit" placeholder="Apt 4B" {...register('unit')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Orlando" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="FL" {...register('state')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" placeholder="32801" {...register('zip')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="housingStatus">Housing Status</Label>
                <Select>
                  <SelectTrigger id="housingStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="own">Own</SelectItem>
                    <SelectItem value="living_with_family">Living with Family</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyHousingPayment">Monthly Housing Payment</Label>
                <Input id="monthlyHousingPayment" placeholder="$1,550" {...register('monthlyHousingPayment')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeAtAddressYears">Time at Address (Years)</Label>
                <Input id="timeAtAddressYears" placeholder="2" {...register('timeAtAddressYears')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeAtAddressMonths">Time at Address (Months)</Label>
                <Input id="timeAtAddressMonths" placeholder="3" {...register('timeAtAddressMonths')} />
              </div>
            </div>

            {/* Employment */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Select>
                  <SelectTrigger id="employmentStatus">
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
                <Input id="employerName" placeholder="Acme Co." {...register('employerName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" placeholder="Sales Associate" {...register('jobTitle')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employerPhone">Employer Phone</Label>
                <Input id="employerPhone" placeholder="(555) 555-0101" {...register('employerPhone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income</Label>
                <Input id="monthlyIncome" placeholder="$3,500" {...register('monthlyIncome')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeAtJobYears">Time at Job (Years)</Label>
                <Input id="timeAtJobYears" placeholder="1" {...register('timeAtJobYears')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeAtJobMonths">Time at Job (Months)</Label>
                <Input id="timeAtJobMonths" placeholder="8" {...register('timeAtJobMonths')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherIncomeSource">Other Income Source</Label>
                <Input id="otherIncomeSource" placeholder="Part-time, SSI, etc." {...register('otherIncomeSource')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherMonthlyIncome">Other Monthly Income</Label>
                <Input id="otherMonthlyIncome" placeholder="$500" {...register('otherMonthlyIncome')} />
              </div>
            </div>

            {/* Vehicle */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleYear">Vehicle Year</Label>
                <Input id="vehicleYear" placeholder="2020" {...register('vehicleYear')} />
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
                <Input id="vehicleTrim" placeholder="SE" {...register('vehicleTrim')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="downPayment">Down Payment</Label>
                <Input id="downPayment" placeholder="$2,000" {...register('downPayment')} />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Submit Application</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
