"use client"

import React from "react"

import { useActionState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { submitInquiry } from "@/actions/inquiry-actions"

interface CarDetailsForInquiry {
    id: string
    name: string
    model_year: number
    vin: string
    price: number | null
    body_style: string | null
    drivetrain: string | null
    trim: string | null
    cylinders: number | null
    custom_id: string | null
    status: string
}

interface InquiryFormClientProps {
    car: CarDetailsForInquiry
    lang: string
}

export function InquiryFormClient({ car, lang }: InquiryFormClientProps) {
    const { t } = useTranslation()
    const { toast } = useToast()

    // Define the initial state for useActionState
    const initialState = {
        status: null,
        message: "",
    }

    // useActionState hook
    const [state, formAction, isPending] = useActionState(submitInquiry, initialState)

    // Use useEffect to show toast notifications when the state changes
    // This replaces the previous manual formMessage state and useSearchParams logic
    React.useEffect(() => {
        if (state.status === "success") {
            toast({
                title: t("inquire_page.inquiry_success_title"),
                description: state.message,
                variant: "default",
            })
        } else if (state.status === "error") {
            toast({
                title: t("inquire_page.inquiry_error_title"),
                description: state.message,
                variant: "destructive",
            })
        }
    }, [state, toast, t])

    return (
        <Card className="w-full max-w-md mx-auto bg-card text-card-foreground">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">{t("inquire_page.title")}</CardTitle>
                <CardDescription className="text-center">
                    {t("inquire_page.description", { carName: car.name })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    {/* Hidden inputs for car details and language */}
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="car_id" value={car.id} />
                    <input type="hidden" name="car_name_at_inquiry" value={car.name} />
                    <input type="hidden" name="car_model_year" value={car.model_year} />
                    <input type="hidden" name="car_vin" value={car.vin} />
                    <input type="hidden" name="car_price" value={car.price !== null ? car.price : ""} />
                    <input type="hidden" name="car_body_style" value={car.body_style || ""} />
                    <input type="hidden" name="car_drivetrain" value={car.drivetrain || ""} />
                    <input type="hidden" name="car_trim" value={car.trim || ""} />
                    <input type="hidden" name="car_cylinders" value={car.cylinders !== null ? car.cylinders : ""} />
                    <input type="hidden" name="car_custom_id" value={car.custom_id || ""} />
                    <input type="hidden" name="car_status" value={car.status || ""} />

                    <div className="space-y-2">
                        <Label htmlFor="name">{t("inquire_page.your_name")}</Label>
                        <Input id="name" name="name" type="text" placeholder={t("inquire_page.placeholder_name")} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t("inquire_page.your_email")}</Label>
                        <Input id="email" name="email" type="email" placeholder={t("inquire_page.placeholder_email")} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone_number">{t("inquire_page.your_phone")}</Label>
                        <Input id="phone_number" name="phone_number" type="tel" placeholder={t("inquire_page.placeholder_phone")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">{t("inquire_page.your_message")}</Label>
                        <Textarea id="message" name="message" placeholder={t("inquire_page.placeholder_message")} rows={4} />
                    </div>
                    {/* Display message from action state if available */}
                    {state.message && (
                        <div
                            className={`p-3 rounded-md text-sm ${state.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                        >
                            {state.message}
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? t("inquire_page.submitting") : t("inquire_page.submit_inquiry")}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
