"use client"

import type React from "react"
import { useState, useEffect, useRef, useTransition } from "react"
import Image from "next/image"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // Updated imports
import { Badge } from "@/components/ui/badge" // New import for Badge
import { carData } from "@/lib/car-data"
import { uploadImages } from "@/actions/upload-images"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

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
    trim: string | null
    cylinders: number | null
}

interface Enquiry {
    id: string
    name: string
    email: string
    phone_number: string | null
    car_id: string | null
    enquiry_date: string
    message: string | null
    car_name_at_inquiry: string | null
    cars: { name: string } | null
}

// New interface for most visited car stats
interface MostVisitedCarStat {
    car_id: string
    car_name: string
    views: number
}

interface AdminDashboardClientProps {
    lang: string
    status?: string
    message?: string
    initialCars: Car[]
    initialEnquiries: Enquiry[]
    initialMostVisitedCars: MostVisitedCarStat[] // Use new interface
    handleChangePassword: (formData: FormData, lang: string) => Promise<{ status: string; message: string }>
    handleLogout: (lang: string) => Promise<void>
    handleDeleteCar: (carId: string, lang: string) => Promise<void>
    handleAddCar: (formData: FormData, lang: string) => Promise<{ status: string; message: string }>
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
    const { t } = useTranslation("translation")
    const router = useRouter()
    const { toast } = useToast()
    const [cars, setCars] = useState<Car[]>(initialCars)
    const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries)
    const [mostVisitedCars, setMostVisitedCars] = useState<MostVisitedCarStat[]>(initialMostVisitedCars) // Use new interface
    const [isTransitioning, startTransition] = useTransition()

    const [showPasswordDialog, setShowPasswordDialog] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const [showAddCarDialog, setShowAddCarDialog] = useState(false)
    const [newCarData, setNewCarData] = useState<Partial<Car>>({})
    const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])
    const [addCarError, setAddCarError] = useState("")

    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
    const [carToDelete, setCarToDelete] = useState<string | null>(null)

    const addCarBrandInputRef = useRef<HTMLInputElement>(null)
    const addCarModelInputRef = useRef<HTMLInputElement>(null)
    const addCarFormRef = useRef<HTMLFormElement>(null)

    const [showBrandDropdown, setShowBrandDropdown] = useState(false)
    const [showModelDropdown, setShowModelDropdown] = useState(false)

    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadMessage, setUploadMessage] = useState("")

    const [isAddingCar, setIsAddingCar] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isDeletingCar, setIsDeletingCar] = useState(false)

    const filteredAddCarBrands = newCarData.brand
        ? carData.filter((car) => car.brand.toLowerCase().startsWith(newCarData.brand!.toLowerCase()))
        : carData

    const selectedAddCarBrandData = carData.find((car) => car.brand.toLowerCase() === newCarData.brand?.toLowerCase())
    const availableAddCarModels = selectedAddCarBrandData ? selectedAddCarBrandData.models : []

    const filteredAddCarModels = newCarData.model
        ? availableAddCarModels.filter((model) => model.toLowerCase().startsWith(newCarData.model!.toLowerCase()))
        : availableAddCarModels

    useEffect(() => {
        setCars(initialCars)
        setEnquiries(initialEnquiries)
        setMostVisitedCars(initialMostVisitedCars)
    }, [initialCars, initialEnquiries, initialMostVisitedCars])

    useEffect(() => {
        if (newCarData.brand && newCarData.model) {
            setConstructedCarName(`${newCarData.brand!} ${newCarData.model!}`)
        } else {
            setConstructedCarName("")
        }
    }, [newCarData.brand, newCarData.model])

    const bodyStyles = ["SUV", "Sedan", "Truck", "Coupe", "Hatchback", "Minivan", "Convertible", "Wagon"]
    const drivetrains = ["FWD", "RWD", "AWD", "4WD"]

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files) {
            setSelectedImageFiles((prevFiles) => [...prevFiles, ...Array.from(files)])
            event.target.value = ""
        }
    }

    const handleClearImages = () => {
        setSelectedImageFiles([])
    }

    const handleSubmitAddCar = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!newCarData.brand || !newCarData.model) {
            toast({
                title: t("admin_dashboard.add_new_car.validation_error"),
                description: t("admin_dashboard.add_new_car.brand_model_required"),
                variant: "destructive",
            })
            return
        }

        setUploadProgress(0)
        setUploadMessage("")
        setAddCarError("")

        const initialFormData = new FormData(event.currentTarget)

        let imageUrls: string[] = []
        if (selectedImageFiles.length > 0) {
            const imageFormData = new FormData()
            selectedImageFiles.forEach((file) => imageFormData.append("images", file))
            try {
                setUploadMessage(t("admin_dashboard.add_new_car.uploading_images"))
                setUploadProgress(25)
                imageUrls = await uploadImages(imageFormData)
                setUploadProgress(75)
            } catch (error) {
                console.error("Error uploading images:", error)
                toast({
                    title: t("admin_dashboard.add_new_car.upload_failed_title"),
                    description: t("admin_dashboard.add_new_car.image_upload_failed"),
                    variant: "destructive",
                })
                setUploadProgress(0)
                setUploadMessage("")
                return
            }
        }

        const carFormData = new FormData()
        for (const [key, value] of initialFormData.entries()) {
            if (key !== "images") {
                carFormData.append(key, value)
            }
        }

        carFormData.set("brand", newCarData.brand!)
        carFormData.set("model", newCarData.model!)
        carFormData.set("name", `${newCarData.brand!} ${newCarData.model!}`)

        imageUrls.forEach((url) => carFormData.append("image_url", url))

        setIsAddingCar(true)
        startTransition(async () => {
            try {
                setUploadMessage(t("admin_dashboard.add_new_car.processing_car_data"))
                const result = await handleAddCar(carFormData, lang)
                setUploadProgress(100)

                if (result?.status === "success") {
                    toast({
                        title: t("admin_dashboard.add_new_car.upload_success_title"),
                        description: result.message,
                        variant: "default",
                    })
                } else {
                    toast({
                        title: t("admin_dashboard.add_new_car.upload_failed_title"),
                        description: result?.message || t("admin_dashboard.add_new_car.failed_to_add_car"),
                        variant: "destructive",
                    })
                }
            } finally {
                setIsAddingCar(false)
                if (addCarFormRef.current) {
                    addCarFormRef.current.reset()
                }
                setNewCarData({})
                setSelectedImageFiles([])
                setTimeout(() => {
                    setUploadProgress(0)
                    setUploadMessage("")
                }, 3000)
                router.refresh()
            }
        })
    }

    const handleDeleteCarAction = async (carId: string) => {
        setIsDeletingCar(true)
        startTransition(async () => {
            try {
                await handleDeleteCar(carId, lang)
                toast({
                    title: t("admin_dashboard.manage_cars.delete_success_title"),
                    description: t("admin_dashboard.manage_cars.delete_success_message"),
                    variant: "default",
                })
            } finally {
                setIsDeletingCar(false)
                router.refresh()
            }
        })
    }

    const handleChangePasswordAction = async (formData: FormData) => {
        setIsChangingPassword(true)
        startTransition(async () => {
            try {
                const result = await handleChangePassword(formData, lang)
                if (result?.status === "success") {
                    toast({
                        title: t("admin_dashboard.change_password.success_title"),
                        description: result.message,
                        variant: "default",
                    })
                } else {
                    toast({
                        title: t("admin_dashboard.change_password.error_title"),
                        description: result?.message || t("admin_dashboard.change_password.failed_to_change_password"),
                        variant: "destructive",
                    })
                }
            } finally {
                setIsChangingPassword(false)
                router.refresh()
            }
        })
    }

    const handleLogoutAction = async () => {
        startTransition(async () => {
            await handleLogout(lang)
            router.push(`/${lang}/admin`)
        })
    }

    const [constructedCarName, setConstructedCarName] = useState("")

    return (
        <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 bg-background text-foreground">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">{t("admin_dashboard.title")}</h1>
                <form action={handleLogoutAction}>
                    <Button variant="outline" className="bg-black text-white">
                        {t("admin_dashboard.logout")}
                    </Button>
                </form>
            </div>

            <Card className="mb-12 bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>{t("admin_dashboard.add_new_car.title")}</CardTitle>
                    <CardDescription>{t("admin_dashboard.add_new_car.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {addCarError && <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 text-center">{addCarError}</div>}
                    <form onSubmit={handleSubmitAddCar} className="space-y-4" ref={addCarFormRef}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2 relative">
                                <Label htmlFor="brand">{t("admin_dashboard.add_new_car.brand")}</Label>
                                <Input
                                    id="brand"
                                    name="brand"
                                    type="text"
                                    placeholder={t("admin_dashboard.add_new_car.placeholder_brand")}
                                    value={newCarData.brand || ""}
                                    onChange={(e) => {
                                        setNewCarData({ ...newCarData, brand: e.target.value })
                                        setConstructedCarName("")
                                        setShowBrandDropdown(true)
                                    }}
                                    onFocus={() => setShowBrandDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowBrandDropdown(false), 100)}
                                    autoComplete="off"
                                    ref={addCarBrandInputRef}
                                />
                                {showBrandDropdown && filteredAddCarBrands.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                        {filteredAddCarBrands.map((car) => (
                                            <li
                                                key={car.brand}
                                                className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    setNewCarData({ ...newCarData, brand: car.brand })
                                                    setConstructedCarName("")
                                                    setShowBrandDropdown(false)
                                                    addCarModelInputRef.current?.focus()
                                                }}
                                            >
                                                {car.brand}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {newCarData.brand && (
                                <div className="space-y-2 relative">
                                    <Label htmlFor="model">{t("admin_dashboard.add_new_car.model")}</Label>
                                    <Input
                                        id="model"
                                        name="model"
                                        type="text"
                                        placeholder={t("admin_dashboard.add_new_car.placeholder_model")}
                                        value={newCarData.model || ""}
                                        onChange={(e) => {
                                            setNewCarData({ ...newCarData, model: e.target.value })
                                            setConstructedCarName("")
                                            setShowModelDropdown(true)
                                        }}
                                        onFocus={() => setShowModelDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowModelDropdown(false), 100)}
                                        disabled={!newCarData.brand}
                                        autoComplete="off"
                                        ref={addCarModelInputRef}
                                    />
                                    {showModelDropdown && filteredAddCarModels.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                            {filteredAddCarModels.map((model) => (
                                                <li
                                                    key={model}
                                                    className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault()
                                                        setNewCarData({ ...newCarData, model: model })
                                                        setConstructedCarName("")
                                                        setShowModelDropdown(false)
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
                                    multiple
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
                                <Label htmlFor="trim">{t("admin_dashboard.add_new_car.trim")}</Label>
                                <Input
                                    id="trim"
                                    name="trim"
                                    type="text"
                                    placeholder={t("admin_dashboard.add_new_car.placeholder_trim")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cylinders">{t("admin_dashboard.add_new_car.cylinders")}</Label>
                                <Input
                                    id="cylinders"
                                    name="cylinders"
                                    type="number"
                                    placeholder={t("admin_dashboard.add_new_car.placeholder_cylinders")}
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
                        {(isAddingCar || uploadProgress > 0) && (
                            <div className="space-y-2">
                                <Progress value={uploadProgress} className="w-full" />
                                {uploadMessage && <p className="text-sm text-center text-muted-foreground">{uploadMessage}</p>}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={isAddingCar}>
                            {t("admin_dashboard.add_new_car.add_car")}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="mb-12 bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>{t("admin_dashboard.change_password.title")}</CardTitle>
                    <CardDescription>{t("admin_dashboard.change_password.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleChangePasswordAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new_password">{t("admin_dashboard.change_password.new_password")}</Label>
                            <Input id="new_password" name="new_password" type="password" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm_password">{t("admin_dashboard.change_password.confirm_new_password")}</Label>
                            <Input id="confirm_password" name="confirm_password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full" disabled={isChangingPassword}>
                            {isChangingPassword
                                ? t("admin_dashboard.change_password.changing_password")
                                : t("admin_dashboard.change_password.change_password_button")}
                        </Button>
                    </form>
                </CardContent>
            </Card>

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
                                            <span className="font-semibold">{t("admin_dashboard.manage_cars.table_trim")}:</span>{" "}
                                            {car.trim || "N/A"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">{t("admin_dashboard.manage_cars.table_cylinders")}:</span>{" "}
                                            {car.cylinders || "N/A"}
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
                                        <form action={() => handleDeleteCarAction(car.id)} className="w-full">
                                            <Button variant="destructive" size="sm" className="w-full" disabled={isDeletingCar}>
                                                {isDeletingCar
                                                    ? t("admin_dashboard.manage_cars.deleting")
                                                    : t("admin_dashboard.manage_cars.delete")}
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

            <Card className="mb-12 bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle>{t("admin_dashboard.most_visited_cars.title")}</CardTitle>
                    <CardDescription>{t("admin_dashboard.most_visited_cars.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {mostVisitedCars && mostVisitedCars.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("admin_dashboard.most_visited_cars.table_name")}</TableHead>
                                        <TableHead className="text-right">{t("admin_dashboard.most_visited_cars.table_views")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mostVisitedCars.map((car) => (
                                        <TableRow key={car.car_id}>
                                            <TableCell className="font-medium">{car.car_name}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary">{car.views}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">{t("admin_dashboard.most_visited_cars.no_view_data")}</p>
                    )}
                </CardContent>
            </Card>

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
                                            {t("admin_dashboard.user_inquiries.table_name")}:{" "}
                                            {enquiry.car_name_at_inquiry || t("admin_dashboard.user_inquiries.car_deleted")}
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
                                            {enquiry.car_name_at_inquiry || t("admin_dashboard.user_inquiries.car_deleted")}
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
