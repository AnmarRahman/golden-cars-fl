import { Logo } from "./logo"
import { getTranslation } from "@/lib/i18n"
// Removed: import { headers } from "next/headers" // No longer needed

export async function Footer({ lang }: { lang: string }) {
  // Accept lang as a prop
  // Removed: const headerList = await headers()
  // Removed: const lang = headerList.get("x-next-intl-locale") || "en"
  const { t } = await getTranslation(lang, "translation")

  return (
    <footer className="bg-black text-white py-8 px-6 md:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-800">
      <div className="flex flex-col items-center md:items-start gap-4">
        <Logo lang={lang} />
        <p className="text-sm text-gray-400 text-center md:text-left">
          &copy; {new Date().getFullYear()} {t("footer.copyright")}
        </p>
      </div>
      <div className="flex flex-col items-center md:items-end gap-4 text-sm text-gray-400">
        <div className="text-center md:text-right">
          <p className="font-semibold text-white">{t("footer.location")}</p>
          <p>{t("footer.address")}</p>
        </div>
        <div className="text-center md:text-right">
          <p className="font-semibold text-white">{t("footer.opening_hours")}</p>
          <p>{t("footer.monday")}</p>
          <p>{t("footer.tuesday")}</p>
          <p>{t("footer.wednesday")}</p>
          <p>{t("footer.thursday")}</p>
          <p>{t("footer.friday")}</p>
          <p>{t("footer.saturday")}</p>
          <p>{t("footer.sunday")}</p>
        </div>
        <div className="text-center md:text-right">
          <p className="font-semibold text-white">{t("footer.phone_number")}</p>
          <p>+1 813-770-7996</p>
        </div>
      </div>
    </footer>
  )
}
