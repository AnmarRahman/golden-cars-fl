import Image from "next/image"
import Link from "next/link"

export function Logo({ lang }: { lang: string }) {
  return (
    <Link href={`/${lang}/`} className="flex items-center justify-center">
      <Image
        src="/logo-2.png"
        alt="Golden Cars FL Logo"
        width={250} // Adjust width as needed
        height={56} // Adjust height as needed
        priority // Prioritize loading for LCP
      />
    </Link>
  )
}
