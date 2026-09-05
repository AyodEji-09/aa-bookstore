"use client"

import { useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ProductRail({
  collection,
  region,
  products,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
  products: HttpTypes.StoreProduct[]
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeDot, setActiveDot] = useState(0)

  if (!products || products.length === 0) {
    return null
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.75
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const maxScroll = container.scrollWidth - container.clientWidth
    if (maxScroll <= 0) return
    const percentage = container.scrollLeft / maxScroll
    const dotIndex = Math.min(4, Math.floor(percentage * 5))
    setActiveDot(dotIndex)
  }

  return (
    <div className="content-container py-10">
      {/* Header with Title and Top-Right Navigation Buttons */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#382C2C] tracking-tight">
          {collection.title}
        </h2>
        <div className="flex items-center gap-x-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-red-300 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-[#980000] transition-colors"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-red-400" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-red-300 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-[#980000] transition-colors"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Non-wrapping Horizontal Carousel Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-nowrap overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[240px] sm:w-[260px] flex-shrink-0 snap-start"
          >
            <ProductPreview product={product} region={region} isFeatured />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-x-2 mt-6">
        {[0, 1, 2, 3, 4].map((dotIdx) => (
          <span
            key={dotIdx}
            className={`transition-all duration-200 rounded-full ${
              dotIdx === activeDot
                ? "w-2.5 h-2.5 bg-[#980000]"
                : "w-2 h-2 bg-red-200"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
