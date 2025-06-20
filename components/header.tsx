"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import { useTranslation } from "react-i18next"
import { useRouter, usePathname } from "next/navigation"

export function Header({ lang }: { lang: string }) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()

  const toggleLanguage = () => {
    const currentLang = i18n.language
    const newLang = currentLang === "en" ? "es" : "en"

    // Construct the new path by replacing the current locale segment
    const pathSegments = pathname.split("/")
    pathSegments[1] = newLang // Replace the language segment
    const newPath = pathSegments.join("/")

    router.push(newPath)
  }

  return (
    <header className="bg-black text-white py-4 px-6 flex items-center justify-between border-b border-gray-800">
      <Logo lang={lang} />
      <nav className="flex items-center gap-4">
        <Button
          variant="outline"
          className="bg-black text-white border-white hover:bg-gray-800"
          onClick={toggleLanguage}
        >
          {i18n.language === "en" ? "Traducir a Español" : "Translate to English"}
        </Button>
        <Link href={`/${i18n.language}/contact`}>
          <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
            {t("contact_page.title")}
          </Button>
        </Link>
      </nav>
    </header>
  )
}
