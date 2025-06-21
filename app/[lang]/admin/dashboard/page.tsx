// This page is a Server Component, responsible for data fetching and passing props to the client component.

import { AdminDashboardClient } from "@/components/admin-dashboard-client"
import { createServerClient, createSupabaseServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslation } from "@/lib/i18n"
import { handleChangePassword, handleLogout, handleDeleteCar, handleAddCar } from "@/actions/admin-actions"

interface Car {
  id: string
  name: string
  image_url: string[]
  mileage: number
  vin: string
  description: string
  model_year: number
  price: number | null
  views: number
  created_at: string
  body_style: string | null
  drivetrain: string | null
  brand: string | null
  model: string | null
}

interface Enquiry {
  id: string
  name: string
  email: string
  phone_number: string | null
  car_id: string | null
  enquiry_date: string
  message: string | null
  cars: { name: string } | null
}

export default async function AdminDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: { status?: string; message?: string }
}) {
  const { lang } = await params
  const { status, message } = searchParams
  const { t } = await getTranslation(lang, "translation") // Use server-side translation

  const supabase = await createSupabaseServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/admin`)
  }

  // Fetch data using server-side Supabase client
  const supabaseAdminData = createServerClient()

  const { data: carsData, error: carsError } = await supabaseAdminData
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false })
  if (carsError) console.error("Error fetching cars:", carsError)

  const { data: enquiriesData, error: enquiriesError } = await supabaseAdminData
    .from("enquiries")
    .select("*, cars(name)")
    .order("enquiry_date", { ascending: false })
  if (enquiriesError) console.error("Error fetching enquiries:", enquiriesError)

  const { data: mostVisitedCarsData, error: mostVisitedCarsError } = await supabaseAdminData
    .from("cars")
    .select("*")
    .order("views", { ascending: false })
    .limit(5)
  if (mostVisitedCarsError) console.error("Error fetching most visited cars:", mostVisitedCarsError)

  const initialCars = (carsData || []) as Car[]
  const initialEnquiries = (enquiriesData || []) as Enquiry[]
  const initialMostVisitedCars = (mostVisitedCarsData || []) as Car[]

  return (
    <AdminDashboardClient
      lang={lang}
      status={status}
      message={message}
      initialCars={initialCars}
      initialEnquiries={initialEnquiries}
      initialMostVisitedCars={initialMostVisitedCars}
      handleChangePassword={handleChangePassword}
      handleLogout={handleLogout}
      handleDeleteCar={handleDeleteCar}
      handleAddCar={handleAddCar}
    />
  )
}
