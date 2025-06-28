import { AdminDashboardClient } from "@/components/admin-dashboard-client"
import { createServerClient, createSupabaseServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import {
  handleChangePassword,
  handleLogout,
  handleDeleteCar,
  handleAddCar,
  handleUpdateCarStatus,
  handleUpdateCar,
} from "@/actions/admin-actions"
import { generateCarPDF } from "@/actions/pdf-actions" // New import

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
  trim: string | null
  cylinders: number | null
  custom_id: string | null
  status: string
}

interface Enquiry {
  id: string
  name: string
  email: string
  phone_number: string | null
  car_id: string | null
  enquiry_date: string
  message: string | null
  car_name_at_inquiry: string | null
  cars: { name: string } | null
}

interface MostVisitedCarStat {
  car_id: string
  car_name: string
  views: number
}

export default async function AdminDashboardPage({
  params,
  searchParams,
}: {
  params: { lang: string }
  searchParams: { status?: string; message?: string }
}) {
  const { lang } = params
  const { status, message } = searchParams
  const { t } = await useTranslation(lang, "translation")

  const supabase = await createSupabaseServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/admin`)
  }

  const supabaseAdminData = createServerClient()
  const { data: carsData, error: carsError } = await supabaseAdminData
    .from("cars")
    .select("*, custom_id, status")
    .order("created_at", { ascending: false })

  if (carsError) console.error("Error fetching cars:", carsError)

  const { data: enquiriesData, error: enquiriesError } = await supabaseAdminData
    .from("enquiries")
    .select("*, car_name_at_inquiry")
    .order("enquiry_date", { ascending: false })

  if (enquiriesError) console.error("Error fetching enquiries:", enquiriesError)

  const { data: mostVisitedCarsData, error: mostVisitedCarsError } = await supabaseAdminData
    .from("car_view_stats")
    .select("car_id, car_name, views")
    .order("views", { ascending: false })
    .limit(5)

  if (mostVisitedCarsError) console.error("Error fetching most visited cars:", mostVisitedCarsError)

  const initialCars = (carsData || []) as Car[]
  const initialEnquiries = (enquiriesData || []) as Enquiry[]
  const initialMostVisitedCars = (mostVisitedCarsData || []) as MostVisitedCarStat[]

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
      handleUpdateCarStatus={handleUpdateCarStatus}
      handleUpdateCar={handleUpdateCar}
      generateCarPDF={generateCarPDF} // New prop
    />
  )
}
