import { redirect } from "next/navigation"
import { createSupabaseServerComponentClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTranslation } from "@/lib/i18n"

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { lang } = await params
  const { error } = await searchParams // Await searchParams here
  const { t } = await getTranslation(lang, "translation")

  const supabase = await createSupabaseServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(`/${lang}/admin/dashboard`)
  }

  const isError = error === "invalid_credentials" // Use the awaited 'error'

  const handleLogin = async (formData: FormData) => {
    "use server"

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const supabaseForLogin = await createSupabaseServerComponentClient()

    const { error } = await supabaseForLogin.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error:", error.message)
      redirect(`/${lang}/admin?error=invalid_credentials`)
    }

    redirect(`/${lang}/admin/dashboard`)
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 flex justify-center items-center min-h-[calc(100vh-160px)] bg-background text-foreground">
      <Card className="w-full max-w-md bg-card text-card-foreground">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{t("admin_login.title")}</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {t("admin_login.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("admin_login.email")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("admin_login.placeholder_email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("admin_login.password")}</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {isError && <p className="text-destructive text-sm text-center">{t("admin_login.invalid_credentials")}</p>}
            <Button type="submit" className="w-full">
              {t("admin_login.login")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
