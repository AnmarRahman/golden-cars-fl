"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableFooter, TableCaption, TableRow } from "@/components/ui/table" // Import TableRow
import { carData } from "@/lib/car-data"

// Define types for props
interface Car {
    id: string
    name: string
    image_url: string[]
    mileage: number
    vin: string
    description: string
    model_year: number
    price: number | null
    views: number
    created_at: string
    body_style: string | null
    drivetrain: string | null
    brand: string | null
    model: string | null
}

interface Enquiry {
    id: string
    name: string
    email: string
    phone_number: string | null
    car_id: string | null
    enquiry_date: string
    message: string | null
    cars: { name: string } | null
}

interface AdminDashboardClientProps {
    lang: string
    status?: string
    message?: string
    initialCars: Car[]
    initialEnquiries: Enquiry[]
    initialMostVisitedCars: Car[]
    handleChangePassword: (formData: FormData, lang: string) => Promise<void>
    handleLogout: (lang: string) => Promise<void>
    handleDeleteCar: (carId: string, lang: string) => Promise<void>
    handleAddCar: (formData: FormData, lang: string) => Promise<void>
}

export function AdminDashboardClient({
    lang,
    status,
    message,
    initialCars,
    initialEnquiries,
    initialMostVisitedCars,
    handleChangePassword,
    handleLogout,
    handleDeleteCar,
    handleAddCar,
}: AdminDashboardClientProps) {
    const { t } = useTranslation()
    const [cars, setCars] = useState<Car[]>(initialCars)
    const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries)
    const [mostVisitedCars, setMostVisitedCars] = useState<Car[]>(initialMostVisitedCars)

    // State for Brand and Model autocomplete in Add New Car form
    const [addCarBrandInput, setAddCarBrandInput] = useState("")
    const [addCarModelInput, setAddCarModelInput] = useState("")
    const [showAddCarBrandSuggestions, setShowAddCarBrandSuggestions] = useState(false)
    const [showAddCarModelSuggestions, setShowAddCarModelSuggestions] = useState(false)
    const [constructedCarName, setConstructedCarName] = useState("")
    const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]) // New state for selected image files

    const addCarBrandInputRef = useRef<HTMLInputElement>(null)
    const addCarModelInputRef = useRef<HTMLInputElement>(null)
    const addCarFormRef = useRef<HTMLFormElement>(null) // Ref for the form to reset it

    // Filtered brands based on addCarBrandInput
    const filteredAddCarBrands = addCarBrandInput
        ? carData.filter((car) => car.brand.toLowerCase().startsWith(addCarBrandInput.toLowerCase()))
        : carData

    // Get models for the selected brand in Add New Car form
    const selectedAddCarBrandData = carData.find((car) => car.brand.toLowerCase() === addCarBrandInput.toLowerCase())
    const availableAddCarModels = selectedAddCarBrandData ? selectedAddCarBrandData.models : []

    // Filtered models based on addCarModelInput and selected brand
    const filteredAddCarModels = addCarModelInput
        ? availableAddCarModels.filter((model) => model.toLowerCase().startsWith(addCarModelInput.toLowerCase()))
        : availableAddCarModels

    // Update local state when initial props change (e.g., after a Server Action revalidates data)
    useEffect(() => {
        setCars(initialCars)
        setEnquiries(initialEnquiries)
        setMostVisitedCars(initialMostVisitedCars)
    }, [initialCars, initialEnquiries, initialMostVisitedCars])

    useEffect(() => {
        if (addCarBrandInput && addCarModelInput) {
            setConstructedCarName(`${addCarBrandInput} ${addCarModelInput}`)
        } else {
            setConstructedCarName("")
        }
    }, [addCarBrandInput, addCarModelInput])

    const bodyStyles = ["SUV", "Sedan", "Truck", "Coupe", "Hatchback", "Minivan", "Convertible", "Wagon"]
    const drivetrains = ["FWD", "RWD", "AWD", "4WD"]

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files) {
            // Append new files to the existing array
            setSelectedImageFiles((prevFiles) => [...prevFiles, ...Array.from(files)])
            // Clear the input value so the same file can be selected again if needed
            event.target.value = ""
        }
    }

    const handleClearImages = () => {
        setSelectedImageFiles([])
    }

    const handleSubmitAddCar = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault() // Prevent default form submission

        if (!addCarBrandInput || !addCarModelInput) {
            // TODO: Display a user-facing error message
            console.error("Car brand and model are required to add a car.")
            return
        }

        const formData = new FormData(event.currentTarget)
        formData.set("name", constructedCarName) // Set the constructed name

        // Remove the original 'images' entry if it exists from the default form submission
        // This is important because if the input had a 'name' attribute, it would add an empty FileList
        // if no files were selected in the last interaction.
        formData.delete("images")

        // Append all selected files from state
        selectedImageFiles.forEach((file) => {
            formData.append("images", file)
        })

        await handleAddCar(formData, lang)

        // Clear form fields after successful submission
        if (addCarFormRef.current) {
            addCarFormRef.current.reset() // Reset the form
        }
        setAddCarBrandInput("")
        setAddCarModelInput("")
        setConstructedCarName("")
        setSelectedImageFiles([]) // Clear selected images
    }

    return (
        <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 bg-background text-foreground">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">{t("admin_dashboard.title")}</h1>
                <form action={() => handleLogout(lang)}>
                    <Button variant="outline" className="bg-black text-white">
                        {t("admin_dashboard.logout")}
                    </Button>
                </form>
            </div>

            {/* Add New Car Section */}
            <Card className="mb-12 bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>{t("admin_dashboard.add_new_car.title")}</CardTitle>
                    <CardDescription>{t("admin_dashboard.add_new_car.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {status === "success" && message && (
                        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 text-center">{message}</div>
                    )}
                    {status === "error" && message && (
                        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 text-center">{message}</div>
                    )}
                    <form onSubmit={handleSubmitAddCar} className="space-y-4" ref={addCarFormRef}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Brand Autocomplete for Add New Car */}
                            <div className="space-y-2 relative">
                                <Label htmlFor="brand">{t("admin_dashboard.add_new_car.brand")}</Label>
                                <Input
                                    id="brand"
                                    name="brand" // Important for form submission
                                    type="text"
                                    placeholder={t("admin_dashboard.add_new_car.placeholder_brand")}
                                    value={addCarBrandInput}
                                    onChange={(e) => {
                                        setAddCarBrandInput(e.target.value)
                                        setShowAddCarBrandSuggestions(true)
                                        setAddCarModelInput("") // Clear model when brand changes
                                    }}
                                    onFocus={() => setShowAddCarBrandSuggestions(true)}
                                    onBlur={(e) => {
                                        setTimeout(() => {
                                            if (!e.currentTarget.contains(document.activeElement)) {
                                                setShowAddCarBrandSuggestions(false)
                                            }
                                        }, 100)
                                    }}
                                    autoComplete="off"
                                    ref={addCarBrandInputRef}
                                />
                                {showAddCarBrandSuggestions && filteredAddCarBrands.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                        {filteredAddCarBrands.map((car) => (
                                            <li
                                                key={car.brand}
                                                className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    setAddCarBrandInput(car.brand)
                                                    setShowAddCarBrandSuggestions(false)
                                                    setAddCarModelInput("") // Clear model when brand is selected
                                                    addCarModelInputRef.current?.focus() // Focus model input after brand selection
                                                }}
                                            >
                                                {car.brand}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Model Autocomplete for Add New Car (only visible if a brand is selected/typed) */}
                            {addCarBrandInput && (
                                <div className="space-y-2 relative">
                                    <Label htmlFor="model">{t("admin_dashboard.add_new_car.model")}</Label>
                                    <Input
                                        id="model"
                                        name="model" // Important for form submission
                                        type="text"
                                        placeholder={t("admin_dashboard.add_new_car.placeholder_model")}
                                        value={addCarModelInput}
                                        onChange={(e) => {
                                            setAddCarModelInput(e.target.value)
                                            setShowAddCarModelSuggestions(true)
                                        }}
                                        onFocus={() => setShowAddCarModelSuggestions(true)}
                                        onBlur={(e) => {
                                            setTimeout(() => {
                                                if (!e.currentTarget.contains(document.activeElement)) {
                                                    setShowAddCarModelSuggestions(false)
                                                }
                                            }, 100)
                                        }}
                                        disabled={!addCarBrandInput}
                                        autoComplete="off"
                                        ref={addCarModelInputRef}
                                    />
                                    {showAddCarModelSuggestions && filteredAddCarModels.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                            {filteredAddCarModels.map((model) => (
                                                <li
                                                    key={model}
                                                    className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault()
                                                        setAddCarModelInput(model)
                                                        setShowAddCarModelSuggestions(false)
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
                                <Label htmlFor="images">{t("admin_dashboard.add_new_car.image_files")}</Label>
                                <Input
                                    id="images"
                                    name="images"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    placeholder={t("admin_dashboard.add_new_car.placeholder_image_files")}
                                />
                                {selectedImageFiles.length > 0 && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        <p className="font-semibold">Selected Files:</p>
                                        <ul className="list-disc list-inside">
                                            {selectedImageFiles.map((file, index) => (
                                                <li key={index}>{file.name}</li>
                                            ))}
                                        </ul>
                                        <Button variant="outline" size="sm" onClick={handleClearImages} className="mt-2">
                                            Clear All Images
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mileage">{t("admin_dashboard.add_new_car.mileage")}</Label>
                                <Input
                                    id="mileage"
                                    name="mileage"
                                    type="number"
                                    placeholder={t("admin_dashboard.add_new_car.placeholder_mileage")}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vin">{t("admin_dashboard.add_new_car.vin")}</Label>
                                <Input
                                    id="vin"
                                    name="vin"
                                    type="text"
                                    placeholder={t("admin_dashboard.add_new_car.placeholder_vin")}
                                    maxLength={17}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model_year">{t("admin_dashboard.add_new_car.model_year")}</Label>
                                <Input
                                    id="model_year"
                                    name="model_year"
                                    type="number"
                                    placeholder={t("admin_dashboard.add_new_car.placeholder_model_year")}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">{t("admin_dashboard.add_new_car.price")}</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    placeholder={t("admin_dashboard.add_new_car.placeholder_price")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="body_style">{t("admin_dashboard.add_new_car.body_style")}</Label>
                                <Select name="body_style" defaultValue="null">
                                    <SelectTrigger id="body_style">
                                        <SelectValue placeholder={t("admin_dashboard.add_new_car.placeholder_body_style")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">{t("search_form.any_body_style")}</SelectItem>
                                        {bodyStyles.map((style) => (
                                            <SelectItem key={style} value={style}>
                                                {t(`search_form.${style.toLowerCase()}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="drivetrain">{t("admin_dashboard.add_new_car.drivetrain")}</Label>
                                <Select name="drivetrain" defaultValue="null">
                                    <SelectTrigger id="drivetrain">
                                        <SelectValue placeholder={t("admin_dashboard.add_new_car.placeholder_drivetrain")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">{t("search_form.any_drivetrain")}</SelectItem>
                                        {drivetrains.map((dt) => (
                                            <SelectItem key={dt} value={dt}>
                                                {t(`search_form.${dt.toLowerCase()}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">{t("admin_dashboard.add_new_car.description")}</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder={t("admin_dashboard.add_new_car.placeholder_description")}
                                rows={4}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            {t("admin_dashboard.add_new_car.add_car")}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Change Password Section */}
            <Card className="mb-12 bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>{t("admin_dashboard.change_password.title")}</CardTitle>
                    <CardDescription>{t("admin_dashboard.change_password.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {status === "success" && message && (
                        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4 text-center">{message}</div>
                    )}
                    {status === "error" && message && (
                        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 text-center">{message}</div>
                    )}
                    <form action={(formData) => handleChangePassword(formData, lang)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new_password">{t("admin_dashboard.change_password.new_password")}</Label>
                            <Input id="new_password" name="new_password" type="password" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm_password">{t("admin_dashboard.change_password.confirm_new_password")}</Label>
                            <Input id="confirm_password" name="confirm_password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                            {t("admin_dashboard.change_password.change_password_button")}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Manage Cars Section */}
            <Card className="mb-12 bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>{t("admin_dashboard.manage_cars.title")}</CardTitle>
                    <CardDescription>{t("admin_dashboard.manage_cars.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {cars && cars.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cars.map((car) => (
                                <Card
                                    key={car.id}
                                    className="rounded-lg shadow-md overflow-hidden bg-card text-card-foreground flex flex-col"
                                >
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={car.image_url[0] || "/placeholder.svg?height=300&width=400"}
                                            alt={car.name}
                                            fill
                                            className="object-cover object-center"
                                        />
                                    </div>
                                    <CardContent className="flex-grow p-4 space-y-2">
                                        <p className="text-lg font-bold">
                                            {t("admin_dashboard.manage_cars.table_name")}: {car.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.manage_cars.table_brand")}:</span>{" "}
                                            {car.brand || "N/A"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.manage_cars.table_model")}:</span>{" "}
                                            {car.model || "N/A"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.manage_cars.table_mileage")}:</span>{" "}
                                            {car.mileage.toLocaleString()} miles
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.manage_cars.table_year")}:</span>{" "}
                                            {car.model_year}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.manage_cars.table_price")}:</span>{" "}
                                            {car.price !== null ? `$${car.price.toLocaleString()}` : t("cars_page.call_for_price")}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.manage_cars.table_vin")}:</span> {car.vin}
                                        </p>
                                        {car.body_style && (
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-semibold">{t("cars_page.body_style")}:</span>{" "}
                                                {t(`search_form.${car.body_style.toLowerCase()}`)}
                                            </p>
                                        )}
                                        {car.drivetrain && (
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-semibold">{t("cars_page.drivetrain")}:</span>{" "}
                                                {t(`search_form.${car.drivetrain.toLowerCase()}`)}
                                            </p>
                                        )}
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <form action={() => handleDeleteCar(car.id, lang)} className="w-full">
                                            <Button variant="destructive" size="sm" className="w-full">
                                                {t("admin_dashboard.manage_cars.delete")}
                                            </Button>
                                        </form>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">{t("admin_dashboard.manage_cars.no_cars_found")}</p>
                    )}
                </CardContent>
            </Card>

            {/* Most Visited Cars Section */}
            <Card className="mb-12 bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>{t("admin_dashboard.most_visited_cars.title")}</CardTitle>
                    <CardDescription>{t("admin_dashboard.most_visited_cars.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {mostVisitedCars && mostVisitedCars.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableFooter>
                                    <TableRow>
                                        <TableCaption>{t("admin_dashboard.most_visited_cars.table_name")}</TableCaption>
                                        <TableCaption>{t("admin_dashboard.most_visited_cars.table_views")}</TableCaption>
                                    </TableRow>
                                </TableFooter>
                                <TableCaption>
                                    {mostVisitedCars.map((car) => (
                                        <TableRow key={car.id}>
                                            <TableCaption className="font-medium">{car.name}</TableCaption>
                                            <TableCaption>{car.views}</TableCaption>
                                        </TableRow>
                                    ))}
                                </TableCaption>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">{t("admin_dashboard.most_visited_cars.no_view_data")}</p>
                    )}
                </CardContent>
            </Card>

            {/* User Inquiries Section */}
            <Card className="bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>{t("admin_dashboard.user_inquiries.title")}</CardTitle>
                    <CardDescription>{t("admin_dashboard.user_inquiries.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {enquiries && enquiries.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enquiries.map((enquiry) => (
                                <Card key={enquiry.id} className="rounded-lg shadow-md bg-card text-card-foreground flex flex-col">
                                    <CardContent className="flex-grow p-4 space-y-2">
                                        <p className="text-lg font-bold">
                                            {t("admin_dashboard.user_inquiries.table_name")}: {enquiry.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.user_inquiries.table_email")}:</span>{" "}
                                            {enquiry.email}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.user_inquiries.table_phone")}:</span>{" "}
                                            {enquiry.phone_number || "N/A"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.user_inquiries.table_car_inquired")}:</span>{" "}
                                            {enquiry.cars?.name || t("admin_dashboard.user_inquiries.car_deleted")}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.user_inquiries.table_date")}:</span>{" "}
                                            {new Date(enquiry.enquiry_date).toLocaleDateString()}
                                        </p>
                                        {enquiry.message && (
                                            <div className="space-y-1">
                                                <p className="font-semibold text-foreground">
                                                    {t("admin_dashboard.user_inquiries.table_message")}:
                                                </p>
                                                <p className="text-muted-foreground text-sm italic">{enquiry.message}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">{t("admin_dashboard.user_inquiries.no_inquiries")}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
