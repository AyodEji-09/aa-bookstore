"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CategoryItem = {
  name: string
  handle: string
}

type NavPillsProps = {
  categories: CategoryItem[]
}

export default function NavPills({ categories }: NavPillsProps) {
  const pathname = usePathname()

  // Clean pathname without country code prefix (e.g. /us/categories/novels -> /categories/novels)
  const pathWithoutCountry = pathname.replace(/^\/[a-z]{2}/, "") || "/"

  return (
    <div className="hidden lg:flex items-center gap-x-2.5">
      {/* Fixed Link 1: Home */}
      <LocalizedClientLink
        href="/"
        className={`px-5 py-1.5 text-xs font-semibold rounded-full transition-all ${
          pathWithoutCountry === "/"
            ? "bg-[#980000] text-white shadow-sm"
            : "border border-gray-200 text-[#4D4C4C] hover:border-[#980000] hover:text-[#980000]"
        }`}
      >
        Home
      </LocalizedClientLink>

      {/* Dynamic Category Pill Links from Backend */}
      {categories.map((cat) => {
        const catPath = `/categories/${cat.handle}`
        const isActive = pathWithoutCountry.startsWith(catPath)
        return (
          <LocalizedClientLink
            key={cat.handle}
            href={catPath}
            className={`px-5 py-1.5 text-xs font-semibold rounded-full transition-all ${
              isActive
                ? "bg-[#980000] text-white shadow-sm"
                : "border border-gray-200 text-[#4D4C4C] hover:border-[#980000] hover:text-[#980000]"
            }`}
          >
            {cat.name}
          </LocalizedClientLink>
        )
      })}

      {/* Fixed Link 2: Contact */}
      <LocalizedClientLink
        href="/store"
        className={`px-5 py-1.5 text-xs font-semibold rounded-full transition-all ${
          pathWithoutCountry.startsWith("/contact")
            ? "bg-[#980000] text-white shadow-sm"
            : "border border-gray-200 text-[#4D4C4C] hover:border-[#980000] hover:text-[#980000]"
        }`}
      >
        Contact
      </LocalizedClientLink>
    </div>
  )
}
