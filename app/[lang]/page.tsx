import { Button } from "@/components/ui/button"
import Image from "next/image"
import { SearchForm } from "@/components/search-form"
import { Suspense } from "react"
import { getTranslation } from "@/lib/i18n"

export default async function HomePage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params // Await params to get the lang property
  const { t } = await getTranslation(lang, "translation")

  return (
    <div className="flex flex-col items-center justify-center bg-background">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        <Image
          src="/hero-bg.png" // Ensure you have this image in your public folder
          alt="Luxury car dealership showroom"
          fill
          quality={100}
          className="z-0 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center p-4 z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-lg mb-4 uppercase">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mb-8">{t("hero.subtitle")}</p>
          <a href="#search-section">
            <Button size="lg" className="text-lg px-8 py-3">
              {t("hero.explore_inventory")}
            </Button>
          </a>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section id="search-section" className="w-full max-w-5xl -mt-20 z-20 p-4">
        <Suspense fallback={<div>{t("cars_page.loading_filters")}</div>}>
          <SearchForm initialSearchParams={{}} />
        </Suspense>
      </section>

      {/* About Us Section (Optional, can be expanded) */}
      <section className="container mx-auto py-16 px-4 md:px-6 lg:px-8 text-center text-foreground">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("about_us.title")}</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t("about_us.description")}</p>
      </section>
    </div>
  )
}
