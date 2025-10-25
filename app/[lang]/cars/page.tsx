import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { CarCard } from "@/components/car-card";
import { SearchForm } from "@/components/search-form";
import Link from "next/link";
import initTranslations from "@/app/i18n";

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

async function getCars(searchParams: SearchParams = {}): Promise<Car[]> {
  const supabase = await createClient();
  let query = supabase.from("cars").select("*");

  // Apply filters if present
  if (searchParams.make && typeof searchParams.make === "string") {
    query = query.eq("make", searchParams.make);
  }
  if (searchParams.model && typeof searchParams.model === "string") {
    query = query.eq("model", searchParams.model);
  }
  if (searchParams.minYear && typeof searchParams.minYear === "string") {
    query = query.gte("year", parseInt(searchParams.minYear));
  }
  if (searchParams.maxYear && typeof searchParams.maxYear === "string") {
    query = query.lte("year", parseInt(searchParams.maxYear));
  }
  if (searchParams.minPrice && typeof searchParams.minPrice === "string") {
    query = query.gte("price", parseFloat(searchParams.minPrice));
  }
  if (searchParams.maxPrice && typeof searchParams.maxPrice === "string") {
    query = query.lte("price", parseFloat(searchParams.maxPrice));
  }
  if (searchParams.minMileage && typeof searchParams.minMileage === "string") {
    query = query.gte("mileage", parseInt(searchParams.minMileage));
  }
  if (searchParams.maxMileage && typeof searchParams.maxMileage === "string") {
    query = query.lte("mileage", parseInt(searchParams.maxMileage));
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
  return data || [];
}

export default async function CarsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  const { t } = await initTranslations(lang, ["common"]);
  const resolvedSearchParams = await searchParams;
  const cars = await getCars(resolvedSearchParams);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8 text-center">
        {t("cars_page.title")}
      </h1>
      
      <Link
        href="/pre-approval"
        className="mb-6 inline-flex items-center justify-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
      >
        Get Pre-Approved
      </Link>
      
      <div className="mb-12">
        <Suspense
          fallback={
            <div className="text-center text-muted-foreground">
              {t("cars_page.loading_filters")}
            </div>
          }
        >
          <SearchForm />
        </Suspense>
      </div>

      {cars.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg">
          {t("cars_page.no_cars_found")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
