import { TableRow } from "@/components/ui/table"
import { createServerClient, createSupabaseServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { revalidatePath } from "next/cache"
import Image from "next/image"
import { getTranslation } from "@/lib/i18n"
import { Table, TableFooter, TableCaption } from "@/components/ui/table"

interface Car {
  id: string
  name: string
  image_url: string
  mileage: number
  vin: string
  description: string
  model_year: number
  price: number | null // Added price
  views: number
  created_at: string
}

interface Enquiry {
  id: string
  name: string
  email: string
  phone_number: string | null
  car_id: string | null
  enquiry_date: string
  message: string | null // Added message
  cars: { name: string } | null // Join with cars table
}

export default async function AdminDashboardPage({
  params,
  searchParams, // Receive searchParams as a Promise
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ status?: string; message?: string }> // Type searchParams as a Promise
}) {
  const { lang } = await params // Await params to get the lang property
  const { status, message } = await searchParams // Await searchParams to get status and message
  const { t } = await getTranslation(lang, "translation")
  const supabase = await createSupabaseServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/admin`)
  }

  const supabaseAdminData = createServerClient()

  const { data: cars, error: carsError } = await supabaseAdminData
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false })
  if (carsError) {
    console.error("Error fetching cars:", carsError)
  }

  const { data: enquiries, error: enquiriesError } = await supabaseAdminData
    .from("enquiries")
    .select("*, cars(name)") // Select message column
    .order("enquiry_date", { ascending: false })
  if (enquiriesError) {
    console.error("Error fetching enquiries:", enquiriesError)
  }

  const { data: mostVisitedCars, error: mostVisitedCarsError } = await supabaseAdminData
    .from("cars")
    .select("*")
    .order("views", { ascending: false })
    .limit(5)
  if (mostVisitedCarsError) {
    console.error("Error fetching most visited cars:", mostVisitedCarsError)
  }

  const handleAddCar = async (formData: FormData) => {
    "use server"

    const name = formData.get("name") as string
    const image_url = formData.get("image_url") as string
    const mileage = Number.parseInt(formData.get("mileage") as string)
    const vin = formData.get("vin") as string
    const description = formData.get("description") as string
    const model_year = Number.parseInt(formData.get("model_year") as string)
    const priceString = formData.get("price") as string // Get price as string

    // Convert price to number or null if empty
    const price = priceString ? Number.parseFloat(priceString) : null

    const supabase = createServerClient()
    const { error } = await supabase.from("cars").insert({
      name,
      image_url,
      mileage,
      vin,
      description,
      model_year,
      price, // Include price
    })

    if (error) {
      console.error("Error adding car:", error.message)
    } else {
      revalidatePath(`/${lang}/admin/dashboard`)
      revalidatePath(`/${lang}/cars`)
    }
  }

  const handleDeleteCar = async (carId: string) => {
    "use server"

    const supabase = createServerClient()
    const { error } = await supabase.from("cars").delete().eq("id", carId)

    if (error) {
      console.error("Error deleting car:", error.message)
    } else {
      revalidatePath(`/${lang}/admin/dashboard`)
      revalidatePath(`/${lang}/cars`)
    }
  }

  const handleChangePassword = async (formData: FormData) => {
    "use server"

    const newPassword = formData.get("new_password") as string
    const confirmPassword = formData.get("confirm_password") as string

    if (newPassword !== confirmPassword) {
      console.error("Password change error: Passwords do not match.")
      redirect(`/${lang}/admin/dashboard?status=error&message=${encodeURIComponent("Passwords do not match.")}`)
    }

    const supabase = await createSupabaseServerComponentClient() // Use session-aware client
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Password change error:", error.message)
      redirect(
        `/${lang}/admin/dashboard?status=error&message=${encodeURIComponent(`Failed to change password: ${error.message}`)}`,
      )
    }

    redirect(`/${lang}/admin/dashboard?status=success&message=${encodeURIComponent("Password updated successfully!")}`)
  }

  const handleLogout = async () => {
    "use server"
    const supabase = await createSupabaseServerComponentClient()
    await supabase.auth.signOut()
    redirect(`/${lang}/admin`)
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 bg-background text-foreground">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{t("admin_dashboard.title")}</h1>
        <form action={handleLogout}>
          <Button variant="outline" className="bg-black text-white">
            {t("admin_dashboard.logout")}
          </Button>
        </form>
      </div>

      {/* Add New Car Section */}
      <Card className="mb-12 bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>{t("admin_dashboard.add_new_car.title")}</CardTitle>
          <CardDescription>{t("admin_dashboard.add_new_car.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleAddCar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("admin_dashboard.add_new_car.car_name")}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t("admin_dashboard.add_new_car.placeholder_car_name")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">{t("admin_dashboard.add_new_car.image_url")}</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  placeholder={t("admin_dashboard.add_new_car.placeholder_image_url")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">{t("admin_dashboard.add_new_car.mileage")}</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  placeholder={t("admin_dashboard.add_new_car.placeholder_mileage")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">{t("admin_dashboard.add_new_car.vin")}</Label>
                <Input
                  id="vin"
                  name="vin"
                  type="text"
                  placeholder={t("admin_dashboard.add_new_car.placeholder_vin")}
                  maxLength={17}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model_year">{t("admin_dashboard.add_new_car.model_year")}</Label>
                <Input
                  id="model_year"
                  name="model_year"
                  type="number"
                  placeholder={t("admin_dashboard.add_new_car.placeholder_model_year")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">{t("admin_dashboard.add_new_car.price")}</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder={t("admin_dashboard.add_new_car.placeholder_price")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("admin_dashboard.add_new_car.description")}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t("admin_dashboard.add_new_car.placeholder_description")}
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full">
              {t("admin_dashboard.add_new_car.add_car")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card className="mb-12 bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>{t("admin_dashboard.change_password.title")}</CardTitle>
          <CardDescription>{t("admin_dashboard.change_password.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && message && (
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 text-center">{message}</div>
          )}
          {status === "error" && message && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 text-center">{message}</div>
          )}
          <form action={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">{t("admin_dashboard.change_password.new_password")}</Label>
              <Input id="new_password" name="new_password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t("admin_dashboard.change_password.confirm_new_password")}</Label>
              <Input id="confirm_password" name="confirm_password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              {t("admin_dashboard.change_password.change_password_button")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Manage Cars Section */}
      <Card className="mb-12 bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>{t("admin_dashboard.manage_cars.title")}</CardTitle>
          <CardDescription>{t("admin_dashboard.manage_cars.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {cars && cars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Card
                  key={car.id}
                  className="rounded-lg shadow-md overflow-hidden bg-card text-card-foreground flex flex-col"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={car.image_url || "/placeholder.svg?height=300&width=400"}
                      alt={car.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <CardContent className="flex-grow p-4 space-y-2">
                    <p className="text-lg font-bold">
                      {t("admin_dashboard.manage_cars.table_name")}: {car.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">{t("admin_dashboard.manage_cars.table_mileage")}:</span>{" "}
                      {car.mileage.toLocaleString()} miles
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">{t("admin_dashboard.manage_cars.table_year")}:</span>{" "}
                      {car.model_year}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">{t("admin_dashboard.manage_cars.table_price")}:</span>{" "}
                      {car.price !== null ? `$${car.price.toLocaleString()}` : t("cars_page.call_for_price")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">{t("admin_dashboard.manage_cars.table_vin")}:</span> {car.vin}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <form action={handleDeleteCar.bind(null, car.id)} className="w-full">
                      <Button variant="destructive" size="sm" className="w-full">
                        {t("admin_dashboard.manage_cars.delete")}
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("admin_dashboard.manage_cars.no_cars_found")}</p>
          )}
        </CardContent>
      </Card>

      {/* Most Visited Cars Section */}
      <Card className="mb-12 bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>{t("admin_dashboard.most_visited_cars.title")}</CardTitle>
          <CardDescription>{t("admin_dashboard.most_visited_cars.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {mostVisitedCars && mostVisitedCars.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableFooter>
                  <TableRow>
                    <TableCaption>{t("admin_dashboard.most_visited_cars.table_name")}</TableCaption>
                    <TableCaption>{t("admin_dashboard.most_visited_cars.table_views")}</TableCaption>
                  </TableRow>
                </TableFooter>
                <TableCaption>
                  {mostVisitedCars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCaption className="font-medium">{car.name}</TableCaption>
                      <TableCaption>{car.views}</TableCaption>
                    </TableRow>
                  ))}
                </TableCaption>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("admin_dashboard.most_visited_cars.no_view_data")}</p>
          )}
        </CardContent>
      </Card>

      {/* User Enquiries Section */}
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>{t("admin_dashboard.user_enquiries.title")}</CardTitle>
          <CardDescription>{t("admin_dashboard.user_enquiries.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {enquiries && enquiries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enquiries.map((enquiry) => (
                <Card key={enquiry.id} className="rounded-lg shadow-md bg-card text-card-foreground flex flex-col">
                  <CardContent className="flex-grow p-4 space-y-2">
                    <p className="text-lg font-bold">
                      {t("admin_dashboard.user_enquiries.table_name")}: {enquiry.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">{t("admin_dashboard.user_enquiries.table_email")}:</span>{" "}
                      {enquiry.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">{t("admin_dashboard.user_enquiries.table_phone")}:</span>{" "}
                      {enquiry.phone_number || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">{t("admin_dashboard.user_enquiries.table_car_enquired")}:</span>{" "}
                      {enquiry.cars?.name || t("admin_dashboard.user_enquiries.car_deleted")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">{t("admin_dashboard.user_enquiries.table_date")}:</span>{" "}
                      {new Date(enquiry.enquiry_date).toLocaleDateString()}
                    </p>
                    {enquiry.message && (
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {t("admin_dashboard.user_enquiries.table_message")}:
                        </p>
                        <p className="text-muted-foreground text-sm italic">{enquiry.message}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("admin_dashboard.user_enquiries.no_enquiries")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
