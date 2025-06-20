"use server"

import { put } from "@vercel/blob"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10)

export async function uploadImages(formData: FormData): Promise<string[]> {
    const files = formData.getAll("images") as File[]
    const uploadedUrls: string[] = []

    for (const file of files) {
        if (!file || file.size === 0) {
            console.warn("Skipping empty or invalid file.")
            continue
        }

        const filename = `${nanoid()}-${file.name}`
        try {
            const blob = await put(filename, file, {
                access: "public",
            })
            uploadedUrls.push(blob.url)
        } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error)
            // Optionally, throw an error or handle it based on your application's needs
            throw new Error(`Failed to upload image: ${file.name}`)
        }
    }
    return uploadedUrls
}
