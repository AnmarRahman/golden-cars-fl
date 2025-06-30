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

  // Helper function to convert image to base64 with proper CORS handling
  const imageToBase64 = async (
    imageUrl: string,
  ): Promise<{ dataUrl: string; width: number; height: number } | null> => {
    try {
      // Fetch the image with proper headers
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PDF-Generator/1.0)",
        },
      })

      if (!response.ok) {
        console.error(`Failed to fetch image: ${response.status} ${response.statusText}`)
        return null
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Detect image format from the buffer
      let mimeType = "image/jpeg" // default
      let format = "JPEG"

      // Check for PNG signature
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        mimeType = "image/png"
        format = "PNG"
      }
      // Check for JPEG signature
      else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
        mimeType = "image/jpeg"
        format = "JPEG"
      }
      // Check for WebP signature
      else if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        mimeType = "image/webp"
        format = "WEBP"
      }

      const base64 = buffer.toString("base64")
      const dataUrl = `data:${mimeType};base64,${base64}`

      // Get image dimensions using a more reliable method
      return new Promise((resolve) => {
        // Create a temporary canvas to get image dimensions
        const img = new Image()
        img.onload = () => {
          resolve({
            dataUrl,
            width: img.width,
            height: img.height,
          })
        }
        img.onerror = () => {
          console.error("Failed to load image for dimension detection")
          resolve(null)
        }
        img.src = dataUrl
      })
    } catch (error) {
      console.error("Error processing image:", error)
      return null
    }
  }

  // Add company logo
  try {
    const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/logo-2.png`
    const logoData = await imageToBase64(logoUrl)

    if (logoData) {
      const scale = 0.2
      const scaledWidth = logoData.width * scale
      const scaledHeight = logoData.height * scale

      // Draw black background rectangle
      doc.setFillColor(0, 0, 0)
      doc.rect(20, 20, scaledWidth, scaledHeight, "F")

      // Add logo image
      doc.addImage(logoData.dataUrl, "PNG", 20, 20, scaledWidth, scaledHeight)
    }
  } catch (err) {
    console.error("Error loading logo:", err)
  }

  // Header
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Vehicle Details Report", 20, 60)
  doc.setDrawColor(goldColor[0], goldColor[1], goldColor[2])
  doc.setLineWidth(2)
  doc.line(20, 65, 190, 65)

  let yPosition = 80

  // Add car image with improved handling
  if (car.image_url && car.image_url.length > 0) {
    try {
      const carImageUrl = car.image_url[0]
      const carImageData = await imageToBase64(carImageUrl)

      if (carImageData) {
        const maxWidth = 150
        const maxHeight = 100

        // Calculate scaled dimensions while maintaining aspect ratio
        let scaledWidth = carImageData.width
        let scaledHeight = carImageData.height

        if (scaledWidth > maxWidth) {
          scaledHeight = (scaledHeight * maxWidth) / scaledWidth
          scaledWidth = maxWidth
        }

        if (scaledHeight > maxHeight) {
          scaledWidth = (scaledWidth * maxHeight) / scaledHeight
          scaledHeight = maxHeight
        }

        // Determine format based on the original image
        const format = carImageData.dataUrl.includes("data:image/png") ? "PNG" : "JPEG"

        doc.addImage(carImageData.dataUrl, format, 20, yPosition, scaledWidth, scaledHeight)
        yPosition += scaledHeight + 10
      } else {
        // Add placeholder text if image fails to load
        doc.setFontSize(12)
        doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
        doc.text("Image could not be loaded", 20, yPosition)
        yPosition += 20
      }
    } catch (err) {
      console.error("Error loading car image:", err)
      // Add error message to PDF
      doc.setFontSize(12)
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
      doc.text("Image loading failed", 20, yPosition)
      yPosition += 20
    }
  }

  // Vehicle Info Title
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(goldColor[0], goldColor[1], goldColor[2])
  doc.text("Vehicle Information", 20, yPosition)
  yPosition += 10

  const details = [
    { label: "Name:", value: car.name || "N/A" },
    { label: "Brand:", value: car.brand || "N/A" },
    { label: "Model:", value: car.model || "N/A" },
    { label: "Year:", value: car.model_year?.toString() || "N/A" },
    { label: "Trim:", value: car.trim || "N/A" },
    { label: "VIN:", value: car.vin || "N/A" },
    { label: "Mileage:", value: car.mileage ? `${car.mileage.toLocaleString()} miles` : "N/A" },
    { label: "Price:", value: car.price ? `$${car.price.toLocaleString()}` : "Contact for Price" },
    { label: "Body Style:", value: car.body_style || "N/A" },
    { label: "Drivetrain:", value: car.drivetrain || "N/A" },
    { label: "Cylinders:", value: car.cylinders?.toString() || "N/A" },
    { label: "Custom ID:", value: car.custom_id || "N/A" },
    { label: "Status:", value: car.status || "N/A" },
  ]

  doc.setFontSize(12)
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])

  for (const detail of details) {
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 30
    }

    doc.setFont("helvetica", "bold")
    doc.text(detail.label, 20, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text(detail.value, 60, yPosition)
    yPosition += 8
  }

  // Description section
  if (car.description) {
    yPosition += 10
    if (yPosition > 240) {
      doc.addPage()
      yPosition = 30
    }

    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2])
    doc.text("Description", 20, yPosition)
    yPosition += 10

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    const splitDescription = doc.splitTextToSize(car.description, 170)
    doc.text(splitDescription, 20, yPosition)
  }

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2])
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 285)
    doc.text(`Page ${i} of ${pageCount}`, 170, 285)
  }

  // Return base64 PDF URI string
  return doc.output("datauristring")
}
