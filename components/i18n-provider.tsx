"use client"

import type React from "react"
import { I18nextProvider } from "react-i18next"
import { getClientI18nInstance } from "@/lib/i18n"
import { useEffect, useState } from "react"

interface I18nProviderProps {
  children: React.ReactNode
  lang: string
  namespaces: string[]
}

export function I18nProvider({ children, lang, namespaces }: I18nProviderProps) {
  const [i18nInstance, setI18nInstance] = useState<any>(null) // State to hold the initialized i18n instance

  useEffect(() => {
    const initializeI18n = async () => {
      const instance = await getClientI18nInstance(lang, namespaces[0] || "translation")
      setI18nInstance(instance)
    }

    initializeI18n()
  }, [lang, namespaces]) // Re-run effect if lang or namespaces change

  // Only render children when the i18n instance is fully initialized
  if (!i18nInstance) {
    return null // Or a loading spinner/placeholder
  }

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
