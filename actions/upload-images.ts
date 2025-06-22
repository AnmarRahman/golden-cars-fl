"use server"

import { put } from "@vercel/blob"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10)

/**
 * Uploads multiple image files to Vercel Blob storage.
 * @param formData - FormData containing the image files under the 'images' key.
 * @returns A promise that resolves to an array of public URLs for the uploaded images.
 */
export async function uploadImages(formData: FormData): Promise<string[]> {
    const files = formData.getAll("images") as File[]
    const uploadedUrls: string[] = []

    for (const file of files) {
        if (!file || file.size === 0) {
            console.warn(`Skipping empty or null file during upload: ${file?.name || "unknown"}`)
            continue
        }

        // Generate a unique filename to prevent collisions
        const filename = `${nanoid()}-${file.name}`

        try {
            console.log(`Attempting to upload file: ${filename}, size: ${file.size} bytes`)
            const blob = await put(filename, file, {
                access: "public", // Make the uploaded image publicly accessible
            })
            uploadedUrls.push(blob.url)
            console.log(`Successfully uploaded: ${blob.url}`)
        } catch (error: any) {
            // Catch as any to access error.message, error.stack etc.
            console.error(`Error uploading file ${file.name}:`, error)
            // Log more details if available
            if (error.message) console.error("Error message:", error.message)
            if (error.stack) console.error("Error stack:", error.stack)
            // If it's a network error with a response body from Blob API
            if (error.response && typeof error.response.text === "function") {
                try {
                    const responseText = await error.response.text()
                    console.error("Error response data:", responseText)
                } catch (parseError) {
                    console.error("Could not parse error response text:", parseError)
                }
            }

            // Re-throw the error so the client-side can catch it and display a message
            throw new Error(`Failed to upload image ${file.name}: ${error.message || "Unknown error"}`)
        }
    }

    return uploadedUrls
}
