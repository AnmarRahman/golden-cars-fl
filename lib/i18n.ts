import { createInstance } from "i18next"
import resourcesToBackend from "i18next-resources-to-backend"
import { initReactI18next } from "react-i18next/initReactI18next"

const defaultNS = "translation"
const fallbackLng = "en"
const languages = ["en", "es"]

// Common options for i18next initialization
function getI18nOptions(lang: string, ns: string | string[]) {
  return {
    lng: lang,
    ns: ns,
    fallbackLng: fallbackLng,
    defaultNS: defaultNS,
    supportedLngs: languages,
    preload: languages,
    react: { useSuspense: false },
  }
}

// Server-side i18n instance initialization for use in Server Components
const initI18nextServer = async (lang: string, ns: string | string[]) => {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) => import(`../public/locales/${language}/${namespace}.json`),
      ),
    )
    .init(getI18nOptions(lang, ns))
  return i18nInstance
}

// Hook for Server Components to get translation function and i18n instance
export async function useTranslation(lang: string, ns: string | string[], options: { keyPrefix?: string } = {}) {
  const i18nextInstance = await initI18nextServer(lang, ns)
  return {
    t: i18nextInstance.getFixedT(lang, Array.isArray(ns) ? ns[0] : ns, options.keyPrefix),
    i18n: i18nextInstance,
  }
}

// Client-side i18n instance (initialized once and reused)
let clientI18nInstance: ReturnType<typeof createInstance> | null = null
let clientI18nPromise: Promise<ReturnType<typeof createInstance>> | null = null

export const getClientI18nInstance = async (lang: string, ns: string | string[]) => {
  if (!clientI18nInstance) {
    if (!clientI18nPromise) {
      clientI18nPromise = (async () => {
        const i18nInstance = createInstance()
        await i18nInstance
          .use(initReactI18next)
          .use(
            resourcesToBackend(
              (language: string, namespace: string) => import(`../public/locales/${language}/${namespace}.json`),
            ),
          )
          .init(getI18nOptions(lang, ns))
        clientI18nInstance = i18nInstance // Store the initialized instance
        return i18nInstance
      })()
    }
    return clientI18nPromise
  } else {
    // If instance already exists, ensure it's configured for the current lang/ns
    if (
      clientI18nInstance.language !== lang ||
      !clientI18nInstance.hasLoadedNamespace(Array.isArray(ns) ? ns[0] : ns)
    ) {
      await clientI18nInstance.changeLanguage(lang)
      await clientI18nInstance.loadNamespaces(ns)
    }
    return clientI18nInstance
  }
}
