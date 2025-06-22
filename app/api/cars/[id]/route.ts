import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const carId = params.id
    const supabase = createServerClient()

    const { data: car, error } = await supabase
        .from("cars")
        .select("*, custom_id, status") // Select new columns
        .eq("id", carId)
        .single()

    if (error) {
        console.error("Error fetching car details from API:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!car) {
        return NextResponse.json({ error: "Car not found" }, { status: 404 })
    }

    return NextResponse.json(car)
}
