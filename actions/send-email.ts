"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Hardcoded full sender (friendly name + email)
const RESEND_DEFAULT_SENDER = "Golden Cars FL <noreply@goldencarsfl.com>"

interface SendEmailOptions {
    to: string | string[]
    subject: string
    html: string
    replyTo?: string
}

export async function sendEmail({
    to,
    subject,
    html,
    replyTo,
}: SendEmailOptions) {
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not set. Email will not be sent.")
        return { success: false, message: "Email service not configured." }
    }

    // Use the full sender address directly
    const fromAddress = RESEND_DEFAULT_SENDER

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
