"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"

interface SearchFormProps {
  initialSearchParams?: {
    q?: string
    model_year?: string
    min_mileage?: string
    max_mileage?: string
    vin?: string
  }
}

export function SearchForm({ initialSearchParams }: SearchFormProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  const { t, i18n } = useTranslation()

  const [q, setQ] = useState(initialSearchParams?.q || "")
  const [modelYear, setModelYear] = useState(initialSearchParams?.model_year || "Any Year")
  const [minMileage, setMinMileage] = useState(initialSearchParams?.min_mileage || "")
  const [maxMileage, setMaxMileage] = useState(initialSearchParams?.max_mileage || "")
  const [vin, setVin] = useState(initialSearchParams?.vin || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (modelYear && modelYear !== "Any Year") params.set("model_year", modelYear)
    if (minMileage) params.set("min_mileage", minMileage)
    if (maxMileage) params.set("max_mileage", maxMileage)
    if (vin) params.set("vin", vin)

    router.push(`/${i18n.language}/cars?${params.toString()}`)
  }

  const handleClear = () => {
    setQ("")
    setModelYear("Any Year")
    setMinMileage("")
    setMaxMileage("")
    setVin("")
    router.push(`/${i18n.language}/cars`) // Redirect to /cars with no params
  }

  // Generate model years for the dropdown
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString())

  return (
    <form onSubmit={handleSearch} className="bg-card text-card-foreground p-6 rounded-lg shadow-md space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="q">{t("search_form.search_by_name_keyword")}</Label>
          <Input
            id="q"
            type="text"
            placeholder={t("search_form.placeholder_name_keyword")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model_year">{t("search_form.model_year")}</Label>
          <Select value={modelYear} onValueChange={setModelYear}>
            <SelectTrigger id="model_year">
              <SelectValue placeholder={t("search_form.model_year")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any Year">{t("search_form.any_year")}</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_mileage">{t("search_form.min_mileage")}</Label>
          <Input
            id="min_mileage"
            type="number"
            placeholder={t("search_form.placeholder_min_mileage")}
            value={minMileage}
            onChange={(e) => setMinMileage(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_mileage">{t("search_form.max_mileage")}</Label>
          <Input
            id="max_mileage"
            type="number"
            placeholder={t("search_form.placeholder_max_mileage")}
            value={maxMileage}
            onChange={(e) => setMaxMileage(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vin">{t("search_form.vin")}</Label>
          <Input
            id="vin"
            type="text"
            placeholder={t("search_form.placeholder_vin")}
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            maxLength={17}
          />
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <Button type="submit">{t("search_form.search_cars")}</Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          {t("search_form.clear_filters")}
        </Button>
      </div>
    </form>
  )
}
