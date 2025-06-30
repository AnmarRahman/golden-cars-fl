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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { carData } from "@/lib/car-data"
import { uploadImages } from "@/actions/upload-images"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { X, Download } from "lucide-react"

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
  custom_id: string | null
  status: string
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

interface MostVisitedCarStat {
  car_id: string
  car_name: string
  views: number
}

interface CarFormData extends Partial<Car> {
  custom_id_prefix?: string
  custom_id_number?: string
}

interface AdminDashboardClientProps {
  lang: string
  status?: string
  message?: string
  initialCars: Car[]
  initialEnquiries: Enquiry[]
  initialMostVisitedCars: MostVisitedCarStat[]
  handleChangePassword: (formData: FormData, lang: string) => Promise<{ status: string; message: string }>
  handleLogout: (lang: string) => Promise<void>
  handleDeleteCar: (carId: string, lang: string) => Promise<void>
  handleAddCar: (formData: FormData, lang: string) => Promise<{ status: string; message: string }>
  handleUpdateCarStatus: (
    carId: string,
    newStatus: string,
    lang: string,
  ) => Promise<{ status: string; message: string }>
  handleUpdateCar: (carId: string, formData: FormData, lang: string) => Promise<{ status: string; message: string }>
  generateCarPDF: (carId: string) => Promise<string>
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
  handleUpdateCarStatus,
  handleUpdateCar,
  generateCarPDF,
}: AdminDashboardClientProps) {
  const { t } = useTranslation("translation")
  const router = useRouter()
  const { toast } = useToast()
  const [cars, setCars] = useState<Car[]>(initialCars)
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries)
  const [mostVisitedCars, setMostVisitedCars] = useState<MostVisitedCarStat[]>(initialMostVisitedCars)
  const [isTransitioning, startTransition] = useTransition()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showAddCarDialog, setShowAddCarDialog] = useState(false)
  const [newCarData, setNewCarData] = useState<CarFormData>({ status: "available" })
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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingCar, setIsUpdatingCar] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null)

  // New states for Edit Car Modal
  const [showEditCarDialog, setShowEditCarDialog] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [editCarData, setEditCarData] = useState<CarFormData>({})
  const [editSelectedImageFiles, setEditSelectedImageFiles] = useState<File[]>([])
  const [editExistingImageUrls, setEditExistingImageUrls] = useState<string[]>([])
  const editCarFormRef = useRef<HTMLFormElement>(null)

  // New states for controlling dropdown visibility in Edit Car modal
  const [showEditBrandDropdown, setShowEditBrandDropdown] = useState(false)
  const [showEditModelDropdown, setShowEditModelDropdown] = useState(false)

  const filteredAddCarBrands = newCarData.brand
    ? carData.filter((car) => car.brand.toLowerCase().startsWith(newCarData.brand!.toLowerCase()))
    : carData

  const selectedAddCarBrandData = carData.find((car) => car.brand.toLowerCase() === newCarData.brand?.toLowerCase())
  const availableAddCarModels = selectedAddCarBrandData ? selectedAddCarBrandData.models : []
  const filteredAddCarModels = newCarData.model
    ? availableAddCarModels.filter((model) => model.toLowerCase().startsWith(newCarData.model!.toLowerCase()))
    : availableAddCarModels

  // For Edit Car Form
  const filteredEditCarBrands = editCarData.brand
    ? carData.filter((car) => car.brand.toLowerCase().startsWith(editCarData.brand!.toLowerCase()))
    : carData

  const selectedEditCarBrandData = carData.find((car) => car.brand.toLowerCase() === editCarData.brand?.toLowerCase())
  const availableEditCarModels = selectedEditCarBrandData ? selectedEditCarBrandData.models : []
  const filteredEditCarModels = editCarData.model
    ? availableEditCarModels.filter((model) => model.toLowerCase().startsWith(editCarData.model!.toLowerCase()))
    : availableEditCarModels

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
  const carStatuses = ["available", "sold", "pending"]

  // Function to resize and compress image
  const processImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 900
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: file.type }))
              } else {
                resolve(file)
              }
            },
            file.type,
            0.8,
          )
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>, isEditForm = false) => {
    const files = event.target.files
    if (files) {
      setUploadMessage(t("admin_dashboard.add_new_car.processing_images_client"))
      setUploadProgress(10)

      const processedFiles: File[] = []
      for (const file of Array.from(files)) {
        const processedFile = await processImage(file)
        processedFiles.push(processedFile)
      }

      if (isEditForm) {
        setEditSelectedImageFiles((prevFiles) => [...prevFiles, ...processedFiles])
      } else {
        setSelectedImageFiles((prevFiles) => [...prevFiles, ...processedFiles])
      }

      event.target.value = ""
      setUploadProgress(0)
      setUploadMessage("")
    }
  }

  const handleClearImages = (isEditForm = false) => {
    if (isEditForm) {
      setEditSelectedImageFiles([])
    } else {
      setSelectedImageFiles([])
    }
  }

  const handleRemoveExistingImage = (urlToRemove: string) => {
    setEditExistingImageUrls((prevUrls) => prevUrls.filter((url) => url !== urlToRemove))
  }

  // Improved PDF generation function with better error handling
  const handlePrintCarDetails = async (carId: string) => {
    setIsGeneratingPDF(carId)
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate the car details PDF...",
        variant: "default",
      })

      const pdfDataUri = await generateCarPDF(carId)

      // Create a link element and trigger download
      const link = document.createElement("a")
      link.href = pdfDataUri
      link.download = `car-details-${carId}-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "PDF Generated Successfully",
        description: "Car details PDF has been downloaded to your device.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(null)
    }
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

    if (!newCarData.custom_id_prefix || !newCarData.custom_id_number || newCarData.custom_id_number.length !== 5) {
      toast({
        title: t("admin_dashboard.add_new_car.validation_error"),
        description: t("admin_dashboard.add_new_car.custom_id_required"),
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
    carFormData.set("custom_id_prefix", newCarData.custom_id_prefix!)
    carFormData.set("custom_id_number", newCarData.custom_id_number!)
    carFormData.set("status", newCarData.status || "available")

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
        setNewCarData({ status: "available" })
        setSelectedImageFiles([])
        setTimeout(() => {
          setUploadProgress(0)
          setUploadMessage("")
        }, 3000)
        router.refresh()
      }
    })
  }

  const handleSubmitEditCar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingCar?.id) {
      toast({
        title: t("admin_dashboard.edit_car.error_title"),
        description: t("admin_dashboard.edit_car.no_car_selected"),
        variant: "destructive",
      })
      return
    }

    if (!editCarData.brand || !editCarData.model) {
      toast({
        title: t("admin_dashboard.edit_car.validation_error"),
        description: t("admin_dashboard.edit_car.brand_model_required"),
        variant: "destructive",
      })
      return
    }

    if (!editCarData.custom_id_prefix || !editCarData.custom_id_number || editCarData.custom_id_number.length !== 5) {
      toast({
        title: t("admin_dashboard.edit_car.validation_error"),
        description: t("admin_dashboard.edit_car.custom_id_required"),
        variant: "destructive",
      })
      return
    }

    setUploadProgress(0)
    setUploadMessage("")

    const initialFormData = new FormData(event.currentTarget)
    let uploadedNewImageUrls: string[] = []

    if (editSelectedImageFiles.length > 0) {
      const imageFormData = new FormData()
      editSelectedImageFiles.forEach((file) => imageFormData.append("images", file))

      try {
        setUploadMessage(t("admin_dashboard.edit_car.uploading_images"))
        setUploadProgress(25)
        uploadedNewImageUrls = await uploadImages(imageFormData)
        setUploadProgress(75)
      } catch (error) {
        console.error("Error uploading images:", error)
        toast({
          title: t("admin_dashboard.edit_car.upload_failed_title"),
          description: t("admin_dashboard.edit_car.image_upload_failed"),
          variant: "destructive",
        })
        setUploadProgress(0)
        setUploadMessage("")
        return
      }
    }

    const finalImageUrls = [...editExistingImageUrls, ...uploadedNewImageUrls]

    const carFormData = new FormData()
    for (const [key, value] of initialFormData.entries()) {
      if (key !== "images") {
        carFormData.append(key, value)
      }
    }

    carFormData.set("brand", editCarData.brand!)
    carFormData.set("model", editCarData.model!)
    carFormData.set("name", `${editCarData.brand!} ${editCarData.model!}`)
    carFormData.set("custom_id_prefix", editCarData.custom_id_prefix!)
    carFormData.set("custom_id_number", editCarData.custom_id_number!)
    carFormData.set("status", editCarData.status || "available")

    finalImageUrls.forEach((url) => carFormData.append("image_url", url))

    setIsUpdatingCar(true)
    startTransition(async () => {
      try {
        setUploadMessage(t("admin_dashboard.edit_car.processing_car_data"))
        const result = await handleUpdateCar(editingCar.id, carFormData, lang)
        setUploadProgress(100)

        if (result?.status === "success") {
          toast({
            title: t("admin_dashboard.edit_car.success_title"),
            description: result.message,
            variant: "default",
          })
          setShowEditCarDialog(false)
        } else {
          toast({
            title: t("admin_dashboard.edit_car.error_title"),
            description: result?.message || t("admin_dashboard.edit_car.failed_to_update_car"),
            variant: "destructive",
          })
        }
      } finally {
        setIsUpdatingCar(false)
        setEditCarData({})
        setEditSelectedImageFiles([])
        setEditExistingImageUrls([])
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

  const handleUpdateCarStatusAction = async (carId: string, newStatus: string) => {
    setIsUpdatingStatus(true)
    startTransition(async () => {
      try {
        const result = await handleUpdateCarStatus(carId, newStatus, lang)
        if (result?.status === "success") {
          toast({
            title: t("admin_dashboard.manage_cars.status_update_success_title"),
            description: result.message,
            variant: "default",
          })
        } else {
          toast({
            title: t("admin_dashboard.manage_cars.status_update_error_title"),
            description: result?.message || t("admin_dashboard.manage_cars.failed_to_update_status"),
            variant: "destructive",
          })
        }
      } finally {
        setIsUpdatingStatus(false)
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

  const getDaysSincePosted = (createdAt: string) => {
    const postDate = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - postDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleEditButtonClick = (car: Car) => {
    setEditingCar(car)
    const [prefix, number] = car.custom_id?.split("#") || ["", ""]
    setEditCarData({
      ...car,
      custom_id_prefix: prefix,
      custom_id_number: number,
    })
    setEditExistingImageUrls(car.image_url || [])
    setEditSelectedImageFiles([])
    setShowEditCarDialog(true)
    setShowEditBrandDropdown(false)
    setShowEditModelDropdown(false)
  }

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
                  onBlur={() => setTimeout(() => setShowBrandDropdown(false), 300)}
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
                    onBlur={() => setTimeout(() => setShowModelDropdown(false), 300)}
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

              <div className="grid grid-cols-2 gap-2 items-baseline">
                <div className="space-y-2">
                  <Label htmlFor="custom_id_prefix">{t("admin_dashboard.add_new_car.custom_id_prefix")}</Label>
                  <Select
                    name="custom_id_prefix"
                    value={newCarData.custom_id_prefix || ""}
                    onValueChange={(value) => setNewCarData({ ...newCarData, custom_id_prefix: value })}
                  >
                    <SelectTrigger id="custom_id_prefix" className="h-10">
                      <SelectValue placeholder={t("admin_dashboard.add_new_car.placeholder_custom_id_prefix")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_id_number">{t("admin_dashboard.add_new_car.custom_id_number")}</Label>
                  <Input
                    id="custom_id_number"
                    name="custom_id_number"
                    type="text"
                    placeholder={t("admin_dashboard.add_new_car.placeholder_custom_id_number")}
                    maxLength={5}
                    value={newCarData.custom_id_number || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setNewCarData({ ...newCarData, custom_id_number: value })
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">{t("admin_dashboard.add_new_car.image_files")}</Label>
                <Input
                  id="images"
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, false)}
                />
                {selectedImageFiles.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p className="font-semibold">Selected Files:</p>
                    <ul className="list-disc list-inside">
                      {selectedImageFiles.map((file, index) => (
                        <li key={index}>
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" onClick={() => handleClearImages(false)} className="mt-2">
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

              <div className="space-y-2">
                <Label htmlFor="status">{t("admin_dashboard.add_new_car.status")}</Label>
                <Select
                  name="status"
                  value={newCarData.status || "available"}
                  onValueChange={(value) => setNewCarData({ ...newCarData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder={t("admin_dashboard.add_new_car.placeholder_status")} />
                  </SelectTrigger>
                  <SelectContent>
                    {carStatuses.map((statusOption) => (
                      <SelectItem key={statusOption} value={statusOption}>
                        {t(`status.${statusOption}`)}
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
                    {car.custom_id && (
                      <div className="absolute top-2 right-2 bg-gray-700/80 text-white px-2 py-1 rounded-md text-xs font-semibold">
                        {car.custom_id}
                      </div>
                    )}
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
                    <p className="text-sm text-muted-foreground">
                      {t("admin_dashboard.manage_cars.days_since_posted_full", {
                        count: getDaysSincePosted(car.created_at),
                      })}
                    </p>

                    <div className="space-y-1">
                      <Label htmlFor={`status-${car.id}`} className="text-sm font-semibold">
                        {t("admin_dashboard.manage_cars.status")}:
                      </Label>
                      <Select
                        value={car.status}
                        onValueChange={(value) => handleUpdateCarStatusAction(car.id, value)}
                        disabled={isUpdatingStatus}
                      >
                        <SelectTrigger id={`status-${car.id}`} className="w-[180px]">
                          <SelectValue placeholder={t("admin_dashboard.add_new_car.placeholder_status")} />
                        </SelectTrigger>
                        <SelectContent>
                          {carStatuses.map((statusOption) => (
                            <SelectItem key={statusOption} value={statusOption}>
                              {t(`status.${statusOption}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleEditButtonClick(car)}
                    >
                      {t("admin_dashboard.manage_cars.edit")}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePrintCarDetails(car.id)}
                      disabled={isGeneratingPDF === car.id}
                    >
                      {isGeneratingPDF === car.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </>
                      )}
                    </Button>
                    <form action={() => handleDeleteCarAction(car.id)} className="flex-1">
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

      {editingCar && (
        <Dialog open={showEditCarDialog} onOpenChange={setShowEditCarDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("admin_dashboard.edit_car.title")}</DialogTitle>
              <DialogDescription>{t("admin_dashboard.edit_car.description")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEditCar} className="space-y-4" ref={editCarFormRef}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="edit_brand">{t("admin_dashboard.edit_car.brand")}</Label>
                  <Input
                    id="edit_brand"
                    name="brand"
                    type="text"
                    placeholder={t("admin_dashboard.edit_car.placeholder_brand")}
                    value={editCarData.brand || ""}
                    onChange={(e) => {
                      setEditCarData({ ...editCarData, brand: e.target.value })
                    }}
                    onFocus={() => setShowEditBrandDropdown(true)}
                    onBlur={() => setTimeout(() => setShowEditBrandDropdown(false), 300)}
                    autoComplete="off"
                  />
                  {showEditBrandDropdown && filteredEditCarBrands.length > 0 && (
                    <ul className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                      {filteredEditCarBrands.map((car) => (
                        <li
                          key={car.brand}
                          className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            setEditCarData({ ...editCarData, brand: car.brand })
                            setShowEditBrandDropdown(false)
                          }}
                        >
                          {car.brand}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {editCarData.brand && (
                  <div className="space-y-2 relative">
                    <Label htmlFor="edit_model">{t("admin_dashboard.edit_car.model")}</Label>
                    <Input
                      id="edit_model"
                      name="model"
                      type="text"
                      placeholder={t("admin_dashboard.edit_car.placeholder_model")}
                      value={editCarData.model || ""}
                      onChange={(e) => {
                        setEditCarData({ ...editCarData, model: e.target.value })
                      }}
                      disabled={!editCarData.brand}
                      onFocus={() => setShowEditModelDropdown(true)}
                      onBlur={() => setTimeout(() => setShowEditModelDropdown(false), 300)}
                      autoComplete="off"
                    />
                    {showEditModelDropdown && filteredEditCarModels.length > 0 && (
                      <ul className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                        {filteredEditCarModels.map((model) => (
                          <li
                            key={model}
                            className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setEditCarData({ ...editCarData, model: model })
                              setShowEditModelDropdown(false)
                            }}
                          >
                            {model}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 items-baseline">
                  <div className="space-y-2">
                    <Label htmlFor="edit_custom_id_prefix">{t("admin_dashboard.edit_car.custom_id_prefix")}</Label>
                    <Select
                      name="custom_id_prefix"
                      value={editCarData.custom_id_prefix || ""}
                      onValueChange={(value) => setEditCarData({ ...editCarData, custom_id_prefix: value })}
                    >
                      <SelectTrigger id="edit_custom_id_prefix" className="h-10">
                        <SelectValue placeholder={t("admin_dashboard.edit_car.placeholder_custom_id_prefix")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_custom_id_number">{t("admin_dashboard.edit_car.custom_id_number")}</Label>
                    <Input
                      id="edit_custom_id_number"
                      name="custom_id_number"
                      type="text"
                      placeholder={t("admin_dashboard.edit_car.placeholder_custom_id_number")}
                      maxLength={5}
                      value={editCarData.custom_id_number || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        setEditCarData({ ...editCarData, custom_id_number: value })
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 col-span-full">
                  <Label htmlFor="edit_images">{t("admin_dashboard.edit_car.image_files")}</Label>
                  <Input
                    id="edit_images"
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, true)}
                  />
                  {(editExistingImageUrls.length > 0 || editSelectedImageFiles.length > 0) && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p className="font-semibold">{t("admin_dashboard.edit_car.current_images")}:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editExistingImageUrls.map((url, index) => (
                          <div
                            key={`existing-${index}`}
                            className="relative w-24 h-24 border rounded-md overflow-hidden"
                          >
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={`Existing car image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 h-6 w-6 rounded-full"
                              onClick={() => handleRemoveExistingImage(url)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">{t("admin_dashboard.edit_car.remove_image")}</span>
                            </Button>
                          </div>
                        ))}
                        {editSelectedImageFiles.map((file, index) => (
                          <div key={`new-${index}`} className="relative w-24 h-24 border rounded-md overflow-hidden">
                            <Image
                              src={URL.createObjectURL(file) || "/placeholder.svg"}
                              alt={`New car image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 h-6 w-6 rounded-full"
                              onClick={() => setEditSelectedImageFiles((prev) => prev.filter((_, i) => i !== index))}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">{t("admin_dashboard.edit_car.remove_new_image")}</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleClearImages(true)} className="mt-2">
                        {t("admin_dashboard.edit_car.clear_all_images")}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_mileage">{t("admin_dashboard.edit_car.mileage")}</Label>
                  <Input
                    id="edit_mileage"
                    name="mileage"
                    type="number"
                    placeholder={t("admin_dashboard.edit_car.placeholder_mileage")}
                    value={editCarData.mileage || ""}
                    onChange={(e) => setEditCarData({ ...editCarData, mileage: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_vin">{t("admin_dashboard.edit_car.vin")}</Label>
                  <Input
                    id="edit_vin"
                    name="vin"
                    type="text"
                    placeholder={t("admin_dashboard.edit_car.placeholder_vin")}
                    maxLength={17}
                    value={editCarData.vin || ""}
                    onChange={(e) => setEditCarData({ ...editCarData, vin: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_model_year">{t("admin_dashboard.edit_car.model_year")}</Label>
                  <Input
                    id="edit_model_year"
                    name="model_year"
                    type="number"
                    placeholder={t("admin_dashboard.edit_car.placeholder_model_year")}
                    value={editCarData.model_year || ""}
                    onChange={(e) => setEditCarData({ ...editCarData, model_year: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_price">{t("admin_dashboard.edit_car.price")}</Label>
                  <Input
                    id="edit_price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder={t("admin_dashboard.edit_car.placeholder_price")}
                    value={editCarData.price || ""}
                    onChange={(e) => setEditCarData({ ...editCarData, price: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_trim">{t("admin_dashboard.edit_car.trim")}</Label>
                  <Input
                    id="edit_trim"
                    name="trim"
                    type="text"
                    placeholder={t("admin_dashboard.edit_car.placeholder_trim")}
                    value={editCarData.trim || ""}
                    onChange={(e) => setEditCarData({ ...editCarData, trim: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_cylinders">{t("admin_dashboard.edit_car.cylinders")}</Label>
                  <Input
                    id="edit_cylinders"
                    name="cylinders"
                    type="number"
                    placeholder={t("admin_dashboard.edit_car.placeholder_cylinders")}
                    value={editCarData.cylinders || ""}
                    onChange={(e) => setEditCarData({ ...editCarData, cylinders: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_body_style">{t("admin_dashboard.edit_car.body_style")}</Label>
                  <Select
                    name="body_style"
                    value={editCarData.body_style || "null"}
                    onValueChange={(value) =>
                      setEditCarData({ ...editCarData, body_style: value === "null" ? null : value })
                    }
                  >
                    <SelectTrigger id="edit_body_style">
                      <SelectValue placeholder={t("admin_dashboard.edit_car.placeholder_body_style")} />
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
                  <Label htmlFor="edit_drivetrain">{t("admin_dashboard.edit_car.drivetrain")}</Label>
                  <Select
                    name="drivetrain"
                    value={editCarData.drivetrain || "null"}
                    onValueChange={(value) =>
                      setEditCarData({ ...editCarData, drivetrain: value === "null" ? null : value })
                    }
                  >
                    <SelectTrigger id="edit_drivetrain">
                      <SelectValue placeholder={t("admin_dashboard.edit_car.placeholder_drivetrain")} />
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

                <div className="space-y-2">
                  <Label htmlFor="edit_status">{t("admin_dashboard.edit_car.status")}</Label>
                  <Select
                    name="status"
                    value={editCarData.status || "available"}
                    onValueChange={(value) => setEditCarData({ ...editCarData, status: value })}
                  >
                    <SelectTrigger id="edit_status">
                      <SelectValue placeholder={t("admin_dashboard.edit_car.placeholder_status")} />
                    </SelectTrigger>
                    <SelectContent>
                      {carStatuses.map((statusOption) => (
                        <SelectItem key={statusOption} value={statusOption}>
                          {t(`status.${statusOption}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_description">{t("admin_dashboard.edit_car.description")}</Label>
                <Textarea
                  id="edit_description"
                  name="description"
                  placeholder={t("admin_dashboard.edit_car.placeholder_description")}
                  rows={4}
                  value={editCarData.description || ""}
                  onChange={(e) => setEditCarData({ ...editCarData, description: e.target.value })}
                />
              </div>

              {(isUpdatingCar || uploadProgress > 0) && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  {uploadMessage && <p className="text-sm text-center text-muted-foreground">{uploadMessage}</p>}
                </div>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {t("common.cancel")}
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isUpdatingCar}>
                  {isUpdatingCar
                    ? t("admin_dashboard.edit_car.updating_car")
                    : t("admin_dashboard.edit_car.update_car")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
