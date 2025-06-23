import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { sendEmail } from "@/actions/send-email" // Import the sendEmail action

export default async function ContactPage({
  params, // Receive params as a Promise
  searchParams,
}: {
  params: Promise<{ lang: string }> // Type params as a Promise
  searchParams: { status?: string }
}) {
  const { lang } = await params // Await params to get the lang property
  const { t } = await useTranslation(lang, "translation")

  const handleContactSubmit = async (formData: FormData) => {
    "use server"

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    // Send email notification to the dealership
    const dealershipEmailResult = await sendEmail({
      to: "goldencarsfl@gmail.com", // Dealership email
      subject: `New Contact Form Submission from ${name}: ${subject}`,
      html: `
        <p>You have a new contact form submission:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      // fromDisplayName: "Golden Cars FL", // Friendly name for the sender
      replyTo: email, // Replies go to the sender's email
    })

    // Removed customer confirmation email for now as per your request.
    // const customerEmailResult = await sendEmail({ ... });

    if (!dealershipEmailResult.success) {
      // Only check dealership email result
      console.error("Dealership email failed to send for contact form.")
      redirect(`/${lang}/contact?status=error`)
    }

    redirect(`/${lang}/contact?status=success`) // Use the awaited lang
  }

  const status = searchParams.status

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 bg-background text-foreground">
      <Card className="w-full max-w-2xl mx-auto bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">{t("contact_page.title")}</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {t("contact_page.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 text-center">
              {t("contact_page.success_message")}
            </div>
          )}
          <form action={handleContactSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("contact_page.full_name")}</Label>
              <Input id="name" name="name" type="text" placeholder={t("contact_page.placeholder_full_name")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("contact_page.email")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("contact_page.placeholder_email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">{t("contact_page.subject")}</Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                placeholder={t("contact_page.placeholder_subject")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t("contact_page.message")}</Label>
              <Textarea
                id="message"
                name="message"
                placeholder={t("contact_page.placeholder_message")}
                rows={5}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t("contact_page.send_message")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
