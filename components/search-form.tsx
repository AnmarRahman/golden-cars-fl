"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import { carData } from "@/lib/car-data" // Import car data

interface SearchFormProps {
  initialSearchParams?: {
    q?: string
    model_year?: string
    min_mileage?: string
    max_mileage?: string
    vin?: string
    price_range?: string
    body_style?: string
    drivetrain?: string
    brand?: string // Added brand
    model?: string // Added model
  }
}

export function SearchForm({ initialSearchParams }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams() // Use useSearchParams directly for current values
  const { t, i18n } = useTranslation()

  const [q, setQ] = useState(initialSearchParams?.q || "")
  const [modelYear, setModelYear] = useState(initialSearchParams?.model_year || "Any Year")
  const [minMileage, setMinMileage] = useState(initialSearchParams?.min_mileage || "")
  const [maxMileage, setMaxMileage] = useState(initialSearchParams?.max_mileage || "")
  const [vin, setVin] = useState(initialSearchParams?.vin || "")
  const [priceRange, setPriceRange] = useState(initialSearchParams?.price_range || "any_price")
  const [bodyStyle, setBodyStyle] = useState(initialSearchParams?.body_style || "any_body_style")
  const [drivetrain, setDrivetrain] = useState(initialSearchParams?.drivetrain || "any_drivetrain")

  // State for Brand and Model autocomplete
  const [brandInput, setBrandInput] = useState(initialSearchParams?.brand || "")
  const [modelInput, setModelInput] = useState(initialSearchParams?.model || "")
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false)
  const [showModelSuggestions, setShowModelSuggestions] = useState(false)

  const brandInputRef = useRef<HTMLInputElement>(null)
  const modelInputRef = useRef<HTMLInputElement>(null)

  // Filtered brands based on brandInput
  const filteredBrands = brandInput
    ? carData.filter((car) => car.brand.toLowerCase().startsWith(brandInput.toLowerCase()))
    : carData

  // Get models for the selected brand
  const selectedBrandData = carData.find((car) => car.brand.toLowerCase() === brandInput.toLowerCase())
  const availableModels = selectedBrandData ? selectedBrandData.models : []

  // Filtered models based on modelInput and selected brand
  const filteredModels = modelInput
    ? availableModels.filter((model) => model.toLowerCase().startsWith(modelInput.toLowerCase()))
    : availableModels

  useEffect(() => {
    // Update state from URL search params on initial load or URL change
    setQ(searchParams.get("q") || "")
    setModelYear(searchParams.get("model_year") || "Any Year")
    setMinMileage(searchParams.get("min_mileage") || "")
    setMaxMileage(searchParams.get("max_mileage") || "")
    setVin(searchParams.get("vin") || "")
    setPriceRange(searchParams.get("price_range") || "any_price")
    setBodyStyle(searchParams.get("body_style") || "any_body_style")
    setDrivetrain(searchParams.get("drivetrain") || "any_drivetrain")
    setBrandInput(searchParams.get("brand") || "")
    setModelInput(searchParams.get("model") || "")
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (modelYear && modelYear !== "Any Year") params.set("model_year", modelYear)
    if (minMileage) params.set("min_mileage", minMileage)
    if (maxMileage) params.set("max_mileage", maxMileage)
    if (vin) params.set("vin", vin)
    if (priceRange && priceRange !== "any_price") params.set("price_range", priceRange)
    if (bodyStyle && bodyStyle !== "any_body_style") params.set("body_style", bodyStyle)
    if (drivetrain && drivetrain !== "any_drivetrain") params.set("drivetrain", drivetrain)
    if (brandInput) params.set("brand", brandInput) // Add brand to params
    if (modelInput) params.set("model", modelInput) // Add model to params

    router.push(`/${i18n.language}/cars?${params.toString()}`)
  }

  const handleClear = () => {
    setQ("")
    setModelYear("Any Year")
    setMinMileage("")
    setMaxMileage("")
    setVin("")
    setPriceRange("any_price")
    setBodyStyle("any_body_style")
    setDrivetrain("any_drivetrain")
    setBrandInput("") // Reset brand
    setModelInput("") // Reset model
    router.push(`/${i18n.language}/cars`) // Redirect to /cars with no params
  }

  // Generate model years for the dropdown
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString())

  const bodyStyles = ["SUV", "Sedan", "Truck", "Coupe", "Hatchback", "Minivan", "Convertible", "Wagon"]
  const drivetrains = ["FWD", "RWD", "AWD", "4WD"]

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

        {/* Brand Autocomplete */}
        <div className="space-y-2 relative">
          <Label htmlFor="brand">{t("search_form.brand")}</Label>
          <Input
            id="brand"
            type="text"
            placeholder={t("search_form.placeholder_brand")}
            value={brandInput}
            onChange={(e) => {
              setBrandInput(e.target.value)
              setShowBrandSuggestions(true)
              setModelInput("") // Clear model when brand changes
            }}
            onFocus={() => setShowBrandSuggestions(true)}
            onBlur={(e) => {
              // Delay hiding to allow click on suggestion
              setTimeout(() => {
                if (!e.currentTarget.contains(document.activeElement)) {
                  setShowBrandSuggestions(false)
                }
              }, 100)
            }}
            autoComplete="off"
            ref={brandInputRef}
          />
          {showBrandSuggestions && filteredBrands.length > 0 && (
            <ul className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
              {filteredBrands.map((car) => (
                <li
                  key={car.brand}
                  className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={(e) => {
                    // Use onMouseDown to prevent onBlur from firing before onClick
                    e.preventDefault()
                    setBrandInput(car.brand)
                    setShowBrandSuggestions(false)
                    setModelInput("") // Clear model when brand is selected
                    modelInputRef.current?.focus() // Focus model input after brand selection
                  }}
                >
                  {car.brand}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Model Autocomplete (only visible if a brand is selected/typed) */}
        {brandInput && (
          <div className="space-y-2 relative">
            <Label htmlFor="model">{t("search_form.model")}</Label>
            <Input
              id="model"
              type="text"
              placeholder={t("search_form.placeholder_model")}
              value={modelInput}
              onChange={(e) => {
                setModelInput(e.target.value)
                setShowModelSuggestions(true)
              }}
              onFocus={() => setShowModelSuggestions(true)}
              onBlur={(e) => {
                setTimeout(() => {
                  if (!e.currentTarget.contains(document.activeElement)) {
                    setShowModelSuggestions(false)
                  }
                }, 100)
              }}
              disabled={!brandInput} // Disable if no brand is selected
              autoComplete="off"
              ref={modelInputRef}
            />
            {showModelSuggestions && filteredModels.length > 0 && (
              <ul className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredModels.map((model) => (
                  <li
                    key={model}
                    className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setModelInput(model)
                      setShowModelSuggestions(false)
                    }}
                  >
                    {model}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

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
        {/* Price Range Filter */}
        <div className="space-y-2">
          <Label htmlFor="price_range">{t("search_form.price_range")}</Label>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger id="price_range">
              <SelectValue placeholder={t("search_form.price_range")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any_price">{t("search_form.any_price")}</SelectItem>
              <SelectItem value="under_10k">{t("search_form.under_10k")}</SelectItem>
              <SelectItem value="10k_20k">{t("search_form.10k_20k")}</SelectItem>
              <SelectItem value="20k_plus">{t("search_form.20k_plus")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* New Body Style Filter */}
        <div className="space-y-2">
          <Label htmlFor="body_style">{t("search_form.body_style")}</Label>
          <Select value={bodyStyle} onValueChange={setBodyStyle}>
            <SelectTrigger id="body_style">
              <SelectValue placeholder={t("search_form.body_style")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any_body_style">{t("search_form.any_body_style")}</SelectItem>
              {bodyStyles.map((style) => (
                <SelectItem key={style} value={style}>
                  {t(`search_form.${style.toLowerCase()}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* New Drivetrain Filter */}
        <div className="space-y-2">
          <Label htmlFor="drivetrain">{t("search_form.drivetrain")}</Label>
          <Select value={drivetrain} onValueChange={setDrivetrain}>
            <SelectTrigger id="drivetrain">
              <SelectValue placeholder={t("search_form.drivetrain")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any_drivetrain">{t("search_form.any_drivetrain")}</SelectItem>
              {drivetrains.map((dt) => (
                <SelectItem key={dt} value={dt}>
                  {t(`search_form.${dt.toLowerCase()}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
