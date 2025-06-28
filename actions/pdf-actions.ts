"use server"

import { createServerClient } from "@/lib/supabase/server"
import { jsPDF } from "jspdf"
import probe from "probe-image-size"

export async function generateCarPDF(carId: string) {
  const supabase = createServerClient()

  const { data: car, error } = await supabase.from("cars").select("*").eq("id", carId).single()

  if (error || !car) {
    throw new Error("Car not found")
  }

  const doc = new jsPDF()

  const goldColor = [218, 165, 32]
  const darkGray = [64, 64, 64]
  const lightGray = [128, 128, 128]

  // Add company logo with black background and original size
  try {
    const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/logo-2.png`

    // Fetch logo image buffer
    const logoResponse = await fetch(logoUrl)
    const logoBuffer = await logoResponse.arrayBuffer()
    const logoBase64 = Buffer.from(logoBuffer).toString("base64")
    const logoDataUrl = `data:image/png;base64,${logoBase64}`

    // Get logo dimensions using probe-image-size
    const logoMeta = await probe(Buffer.from(logoBuffer))

    // Draw black background rectangle sized to logo (scaled down to fit PDF)
    const scale = 0.2 // adjust scaling if needed
    doc.setFillColor(0, 0, 0)
    doc.rect(20, 20, logoMeta.width * scale, logoMeta.height * scale, "F")

    // Add logo image scaled
    doc.addImage(logoDataUrl, "PNG", 20, 20, logoMeta.width * scale, logoMeta.height * scale)
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

  // Load car image with natural dimensions
  if (car.image_url && car.image_url.length > 0) {
    try {
      const carImageUrl = car.image_url[0]
      const carResponse = await fetch(carImageUrl)
      const carBuffer = await carResponse.arrayBuffer()
      const carBase64 = Buffer.from(carBuffer).toString("base64")
      const carDataUrl = `data:image/jpeg;base64,${carBase64}`

      const carMeta = await probe(Buffer.from(carBuffer))

      const scale = 0.25 // adjust scaling here for fitting page nicely
      const scaledWidth = carMeta.width * scale
      const scaledHeight = carMeta.height * scale

      doc.addImage(carDataUrl, "JPEG", 20, yPosition, scaledWidth, scaledHeight)

      yPosition += scaledHeight + 10
    } catch (err) {
      console.error("Error loading car image:", err)
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
