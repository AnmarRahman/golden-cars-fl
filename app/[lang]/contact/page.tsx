"use client" // This page is now a Client Component

import { useEffect, useRef, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Removed redirect as we'll use toast
import { useTranslation } from "react-i18next" // Changed import for client-side use
import { sendEmail } from "@/actions/send-email" // Import the sendEmail action
import { useToast } from "@/hooks/use-toast" // Import useToast

interface ContactPageProps {
  params: { lang: string } // params is no longer a Promise in client component
  searchParams: { status?: string } // status is still here but will be ignored for toast
}

export default function ContactPage({ params }: ContactPageProps) {
  const { lang } = params // Directly access lang
  const { t } = useTranslation() // Client-side useTranslation
  const { toast } = useToast() // Initialize useToast

  // Use useActionState for form submission
  const [formState, formAction, isPending] = useActionState(
    async (prevState: { success: boolean; message: string } | null, formData: FormData) => {
      // --- DEBUG LOG: Log form data when action is triggered ---
      console.log("Contact Form Action Triggered. FormData:", Object.fromEntries(formData.entries()))

      const name = formData.get("name") as string
      const email = formData.get("email") as string
      const subject = formData.get("subject") as string
      const message = formData.get("message") as string

      try {
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
          replyTo: email, // Replies go to the sender's email
        })

        if (!dealershipEmailResult.success) {
          console.error("Dealership email failed to send for contact form:", dealershipEmailResult.message)
          return { success: false, message: t("contact_page.error_message") }
        }

        return { success: true, message: t("contact_page.success_message") }
      } catch (error) {
        console.error("Error during sendEmail call within useActionState:", error)
        return { success: false, message: t("contact_page.error_message") }
      }
    },
    null, // Initial state
  )

  // Ref for the form to reset it
  const formRef = useRef<HTMLFormElement>(null)

  // Effect to show toast based on formState - EXACT FORMAT AS REQUESTED
  useEffect(() => {
    // --- DEBUG LOG: Log formState whenever it changes ---
    console.log("Contact Page - formState changed:", formState)

    if (formState) {
      // --- DEBUG LOG: Log the title and description being passed to toast ---
      const toastTitle = formState.success ? t("contact_page.toast_success_title") : t("contact_page.toast_error_title")
      const toastDescription = formState.message
      console.log("Attempting to show toast with Title:", toastTitle, "Description:", toastDescription)

      toast({
        title: toastTitle,
        description: toastDescription,
        variant: formState.success ? "default" : "destructive",
      })
      // Reset the form after successful submission
      if (formState.success && formRef.current) {
        formRef.current.reset()
      }
    }
  }, [formState, toast, t]) // Dependencies remain the same

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
          {/* Removed conditional status messages */}
          <form action={formAction} className="space-y-6" ref={formRef}>
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("contact_page.sending") : t("contact_page.send_message")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
