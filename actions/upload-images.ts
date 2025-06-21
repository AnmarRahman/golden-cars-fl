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
            continue
        }

        // Generate a unique filename to prevent collisions
        const filename = `${nanoid()}-${file.name}`

        try {
            const blob = await put(filename, file, {
                access: "public", // Make the uploaded image publicly accessible
            })
            uploadedUrls.push(blob.url)
        } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error)
            // Optionally, handle the error more gracefully, e.g., by returning an empty array or throwing
        }
    }

    return uploadedUrls
}
