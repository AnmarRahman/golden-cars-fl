import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerComponentClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerComponentClient()
    
    // Convert string values to appropriate types for database
    const applicationData = {
      reference_number: body.reference_number,
      car_id: body.car_id ? parseInt(body.car_id) : null,
      first_name: body.first_name,
      middle_name: body.middle_name || null,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.date_of_birth || null,
      ssn: body.ssn || null,
      street_address: body.street_address || null,
      unit_apt: body.unit_apt || null,
      city: body.city || null,
      state: body.state || null,
      zip: body.zip || null,
      housing_status: body.housing_status || null,
      monthly_housing_payment: body.monthly_housing_payment ? parseFloat(body.monthly_housing_payment.replace(/[^0-9.]/g, '') || '0') : null,
      time_at_address_years: body.time_at_address_years || null,
      time_at_address_months: body.time_at_address_months || null,
      employment_status: body.employment_status || null,
      employer_name: body.employer_name || null,
      job_title: body.job_title || null,
      employer_phone: body.employer_phone || null,
      monthly_income: body.monthly_income ? parseFloat(body.monthly_income.replace(/[^0-9.]/g, '') || '0') : null,
      time_at_job_years: body.time_at_job_years || null,
      time_at_job_months: body.time_at_job_months || null,
      other_income_source: body.other_income_source || null,
      other_monthly_income: body.other_monthly_income ? parseFloat(body.other_monthly_income.replace(/[^0-9.]/g, '') || '0') : null,
      vehicle_year: body.vehicle_year || null,
      vehicle_make: body.vehicle_make || null,
      vehicle_model: body.vehicle_model || null,
      vehicle_trim: body.vehicle_trim || null,
      down_payment: body.down_payment ? parseFloat(body.down_payment.replace(/[^0-9.]/g, '') || '0') : null,
      status: body.status || 'pending'
    }

    const { data, error } = await supabase
      .from('pre_approval_applications')
      .insert(applicationData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      application: data,
      reference_number: applicationData.reference_number 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
