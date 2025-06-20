import { createInstance } from "i18next"
import resourcesToBackend from "i18next-resources-to-backend"
import { initReactI18next } from "react-i18next/initReactI18next"
import LanguageDetector from "i18next-browser-languagedetector"

const defaultNS = "translation"
const fallbackLng = "en"
const languages = ["en", "es"]

// Server-side initialization: Used by Server Components to get translations.
// Does NOT use LanguageDetector as it's server-only.
export async function getI18nServerInstance(lng: string = fallbackLng, ns: string | string[] = defaultNS) {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) => import(`../public/locales/${language}/${namespace}.json`),
      ),
    )
    .init({
      lng,
      ns,
      fallbackLng,
      defaultNS,
      supportedLngs: languages,
      preload: languages,
      react: { useSuspense: false },
    })
  return i18nInstance
}

// Helper for Server Components to get translation function
export async function getTranslation(lng: string, ns: string | string[] = defaultNS) {
  const i18n = await getI18nServerInstance(lng, ns)
  return {
    t: i18n.t,
    i18n: i18n,
  }
}

// Client-side initialization: Used by the I18nProvider to set up i18next for client components.
// Accepts an optional initialLng to ensure hydration consistency.
export const createI18nClientInstance = (initialLng?: string) => {
  const i18nInstance = createInstance()
  i18nInstance
    .use(initReactI18next)
    .use(LanguageDetector) // Use LanguageDetector for client-side detection
    .use(
      resourcesToBackend(
        (language: string, namespace: string) => import(`../public/locales/${language}/${namespace}.json`),
      ),
    )
    .init({
      lng: initialLng, // Use initialLng if provided, otherwise let detector determine
      ns: defaultNS,
      fallbackLng,
      defaultNS,
      supportedLngs: languages,
      detection: {
        order: ["cookie", "navigator"], // Order of detection methods
        caches: ["cookie"], // Cache detected language in a cookie
        cookieOptions: { path: "/", sameSite: "strict" },
      },
      react: { useSuspense: false },
    })
  return i18nInstance
}
