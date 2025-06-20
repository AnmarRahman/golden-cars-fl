"use client"

import type React from "react"
import { I18nextProvider } from "react-i18next"
import { createI18nClientInstance } from "@/lib/i18n" // Import the client instance creator
import { useState } from "react"

interface I18nProviderProps {
  children: React.ReactNode
  initialLng: string // Add initialLng prop
}

export function I18nProvider({ children, initialLng }: I18nProviderProps) {
  // Create the client-side i18n instance once, passing the initialLng
  const [i18nClientInstance] = useState(() => createI18nClientInstance(initialLng))

  return <I18nextProvider i18n={i18nClientInstance}>{children}</I18nextProvider>
}
