"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
// Use Resend's default sender for now, as you don't have a custom domain verified with Resend.
// For production, it's highly recommended to verify your own domain with Resend
// and use an email address from that domain (e.g., "noreply@yourdomain.com").
const RESEND_DEFAULT_SENDER = "onboarding@resend.dev"

interface SendEmailOptions {
    to: string | string[]
    subject: string
    html: string
    // The 'from' field will now include a friendly name and the Resend default sender.
    fromDisplayName?: string
    replyTo?: string
}

export async function sendEmail({
    to,
    subject,
    html,
    fromDisplayName = "Golden Cars FL", // Default friendly name
    replyTo,
}: SendEmailOptions) {
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not set. Email will not be sent.")
        return { success: false, message: "Email service not configured." }
    }

    // Construct the 'from' string with a friendly name and the Resend default sender
    const fromAddress = `${fromDisplayName} <${RESEND_DEFAULT_SENDER}>`

    try {
        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: to,
            subject: subject,
            html: html,
            replyTo: replyTo,
        })

        if (error) {
            console.error("Error sending email:", error)
            return { success: false, message: error.message }
        }

        console.log("Email sent successfully:", data)
        return { success: true, message: "Email sent successfully!" }
    } catch (error) {
        console.error("Unexpected error sending email:", error)
        return { success: false, message: "An unexpected error occurred while sending email." }
    }
}
