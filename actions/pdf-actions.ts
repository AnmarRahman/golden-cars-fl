"use server"

import { createServerClient } from "@/lib/supabase/server"
import { jsPDF } from "jspdf"

export async function generateCarPDF(carId: string) {
  const supabase = createServerClient()

  const { data: car, error } = await supabase.from("cars").select("*").eq("id", carId).single()

  if (error || !car) {
    throw new Error("Car not found")
  }

  const doc = new jsPDF()
  const goldColor = [218, 165, 32] as const
  const darkGray = [64, 64, 64] as const
  const lightGray = [128, 128, 128] as const

  // Set default font to Helvetica (closest to Inter available in jsPDF)
  doc.setFont("helvetica", "normal")

  // Helper function to get image dimensions and convert to base64
  const imageToBase64 = async (
    imageUrl: string,
  ): Promise<{ dataUrl: string; format: string; width: number; height: number } | null> => {
    try {
      console.log("Fetching image from:", imageUrl)

      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PDF-Generator/1.0)",
          Accept: "image/*",
        },
      })

      if (!response.ok) {
        console.error(`Failed to fetch image: ${response.status} ${response.statusText}`)
        return null
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      if (buffer.length === 0) {
        console.error("Empty buffer received")
        return null
      }

      // Detect image format from the buffer
      let mimeType = "image/jpeg"
      let format = "JPEG"

      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        mimeType = "image/png"
        format = "PNG"
      } else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
        mimeType = "image/jpeg"
        format = "JPEG"
      }

      const base64 = buffer.toString("base64")
      const dataUrl = `data:${mimeType};base64,${base64}`

      // For server-side, we'll use reasonable default dimensions
      const isLogo = imageUrl.includes("logo")
      const width = isLogo ? 200 : 800
      const height = isLogo ? 100 : 600

      return {
        dataUrl,
        format,
        width,
        height,
      }
    } catch (error) {
      console.error("Error processing image:", error)
      return null
    }
  }

  // Helper function to calculate scaled dimensions maintaining aspect ratio
  const getScaledDimensions = (originalWidth: number, originalHeight: number, maxWidth: number, maxHeight: number) => {
    const aspectRatio = originalWidth / originalHeight

    let scaledWidth = maxWidth
    let scaledHeight = maxWidth / aspectRatio

    if (scaledHeight > maxHeight) {
      scaledHeight = maxHeight
      scaledWidth = maxHeight * aspectRatio
    }

    return { width: scaledWidth, height: scaledHeight }
  }

  let currentY = 15

  // Add company logo with proper aspect ratio
  try {
    const logoUrl = process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/logo-2-black.png`
      : `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/logo-2-black.png`

    const logoData = await imageToBase64(logoUrl)

    if (logoData) {
      // Scale logo to fit nicely in header
      const maxLogoWidth = 50
      const maxLogoHeight = 30
      const logoDimensions = getScaledDimensions(logoData.width, logoData.height, maxLogoWidth, maxLogoHeight)

      doc.addImage(logoData.dataUrl, logoData.format, 15, currentY, logoDimensions.width, logoDimensions.height)
      currentY = Math.max(currentY + logoDimensions.height + 15, currentY + 25) // Added more space after logo
    }
  } catch (err) {
    console.error("Error loading logo:", err)
    currentY += 20 // Still add space even if logo fails
  }

  // Header title with Inter-like font (using Helvetica)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.setFontSize(20)
  doc.text("Vehicle Details Report", 15, currentY)

  // Add line under header
  doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2])
  doc.setLineWidth(1.5)
  doc.line(15, currentY + 3, 195, currentY + 3)

  currentY += 15

  // Two-column layout: Car image on left, basic info on right
  const leftColumnX = 15
  const rightColumnX = 110
  const imageStartY = currentY

  // Add car image with proper aspect ratio
  let carImageHeight = 0
  if (car.image_url && car.image_url.length > 0) {
    try {
      const carImageData = await imageToBase64(car.image_url[0])

      if (carImageData) {
        // Scale car image to fit in left column
        const maxImageWidth = 90
        const maxImageHeight = 60
        const imageDimensions = getScaledDimensions(
          carImageData.width,
          carImageData.height,
          maxImageWidth,
          maxImageHeight,
        )

        doc.addImage(
          carImageData.dataUrl,
          carImageData.format,
          leftColumnX,
          currentY,
          imageDimensions.width,
          imageDimensions.height,
        )
        carImageHeight = imageDimensions.height
      }
    } catch (err) {
      console.error("Error loading car image:", err)
    }
  }

  // Basic car info in right column (top section)
  let rightColumnY = currentY
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(goldColor[0], goldColor[1], goldColor[2])
  doc.text("Basic Information", rightColumnX, rightColumnY)
  rightColumnY += 8

  const basicInfo = [
    { label: "Name:", value: car.name || "N/A" },
    { label: "Brand:", value: car.brand || "N/A" },
    { label: "Model:", value: car.model || "N/A" },
    { label: "Year:", value: car.model_year?.toString() || "N/A" },
    { label: "Price:", value: car.price ? `$${car.price.toLocaleString()}` : "Contact for Price" },
  ]

  doc.setFontSize(10)
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])

  for (const info of basicInfo) {
    doc.setFont("helvetica", "bold")
    doc.text(info.label, rightColumnX, rightColumnY)
    doc.setFont("helvetica", "normal")
    doc.text(info.value, rightColumnX + 25, rightColumnY)
    rightColumnY += 6
  }

  // Move to next section - ensure we're below the car image
  currentY = Math.max(imageStartY + carImageHeight + 10, rightColumnY + 5)

  // Vehicle specifications in two columns
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(goldColor[0], goldColor[1], goldColor[2])
  doc.text("Vehicle Specifications", leftColumnX, currentY)
  currentY += 10

  const leftSpecs = [
    { label: "VIN:", value: car.vin || "N/A" },
    { label: "Mileage:", value: car.mileage ? `${car.mileage.toLocaleString()} miles` : "N/A" },
    { label: "Body Style:", value: car.body_style || "N/A" },
    { label: "Drivetrain:", value: car.drivetrain || "N/A" },
  ]

  const rightSpecs = [
    { label: "Trim:", value: car.trim || "N/A" },
    { label: "Cylinders:", value: car.cylinders?.toString() || "N/A" },
    { label: "Custom ID:", value: car.custom_id || "N/A" },
    { label: "Status:", value: car.status || "N/A" },
  ]

  doc.setFontSize(10)
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])

  let leftSpecY = currentY
  let rightSpecY = currentY

  // Left column specs
  for (const spec of leftSpecs) {
    doc.setFont("helvetica", "bold")
    doc.text(spec.label, leftColumnX, leftSpecY)
    doc.setFont("helvetica", "normal")
    doc.text(spec.value, leftColumnX + 30, leftSpecY)
    leftSpecY += 6
  }

  // Right column specs
  for (const spec of rightSpecs) {
    doc.setFont("helvetica", "bold")
    doc.text(spec.label, rightColumnX, rightSpecY)
    doc.setFont("helvetica", "normal")
    doc.text(spec.value, rightColumnX + 25, rightSpecY)
    rightSpecY += 6
  }

  currentY = Math.max(leftSpecY, rightSpecY) + 8

  // Description section (if there's space)
  if (car.description && currentY < 250) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2])
    doc.text("Description", leftColumnX, currentY)
    currentY += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])

    // Limit description to fit on page
    const availableHeight = 270 - currentY
    const maxLines = Math.floor(availableHeight / 5)
    const splitDescription = doc.splitTextToSize(car.description, 170)
    const limitedDescription = splitDescription.slice(0, maxLines)

    doc.text(limitedDescription, leftColumnX, currentY)
  }

  // Footer
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 15, 285)
  doc.text("Page 1 of 1", 170, 285)

  return doc.output("datauristring")
}
