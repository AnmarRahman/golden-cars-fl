import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css" // Note the relative path change
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslation } from "@/lib/i18n"
import { I18nProvider } from "@/components/i18n-provider"
import { Toaster } from "@/components/ui/toaster" // Make sure this is imported

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Golden Cars FL",
  description: "Your premier car dealership in Tampa, FL",
}

// Generate static params for supported languages
export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }]
}

export default async function RootLayout(props: {
  children: React.ReactNode
  params: { lang: string } // Type params as a Promise
}) {
  const { children, params } = props
  const { lang } = params // Await params to get the lang property

  // Initialize server-side i18n for initial render and server components.
  await useTranslation(lang, "translation")

  return (
    <html lang={lang}>
      <body className={inter.className}>
        {/* Pass the server-rendered language to the client-side I18nProvider */}
        <I18nProvider lang={lang} namespaces={["translation"]}>
          <div className="flex flex-col min-h-screen">
            <Header lang={lang} />
            <main className="flex-1">{children}</main>
            {/* Pass lang prop to Footer */}
            <Footer lang={lang} />
          </div>
        </I18nProvider>
        <Toaster /> {/* Add this line */}
      </body>
    </html>
  )
}
