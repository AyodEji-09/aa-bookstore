"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { getPricesForVariant } from "@lib/util/get-product-price"

type ProductFormatsProps = {
  variants: HttpTypes.StoreProductVariant[]
  selectedVariantId?: string
  onSelectVariant: (variant: HttpTypes.StoreProductVariant) => void
}

export default function ProductFormats({
  variants,
  selectedVariantId,
  onSelectVariant,
}: ProductFormatsProps) {
  const formatsContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkFormatsScroll = useCallback(() => {
    const el = formatsContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const hasOverflow = scrollWidth > clientWidth + 2
    setCanScrollLeft(hasOverflow && scrollLeft > 2)
    setCanScrollRight(hasOverflow && scrollLeft + clientWidth < scrollWidth - 2)
  }, [])

  useEffect(() => {
    checkFormatsScroll()
    const timer = setTimeout(checkFormatsScroll, 100)
    window.addEventListener("resize", checkFormatsScroll)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", checkFormatsScroll)
    }
  }, [checkFormatsScroll, variants])

  const scrollFormats = (direction: "left" | "right") => {
    const el = formatsContainerRef.current
    if (!el) return
    const scrollAmount = direction === "left" ? -180 : 180
    el.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  if (!variants || variants.length === 0) return null

  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#382C2C]">Formats</span>
      </div>
      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollFormats("left")}
            aria-label="Previous formats"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 border border-[#980000]/30 text-[#980000] shadow-md hover:bg-white flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={formatsContainerRef}
          onScroll={checkFormatsScroll}
          className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
        >
          {variants.map((variant) => {
            const priceInfo = getPricesForVariant(variant as any)
            const isSelected = variant.id === selectedVariantId
            const priceDisplay = priceInfo?.calculated_price
              ? priceInfo.calculated_price
              : priceInfo?.calculated_price_number === 0
              ? "FREE"
              : "-"

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onSelectVariant(variant)}
                className={`flex flex-col items-center justify-center min-w-[110px] sm:min-w-[120px] px-4 py-3 rounded border text-center transition-all relative overflow-hidden ${
                  isSelected
                    ? "border-[#980000] bg-[#980000]/5 text-[#382C2C] shadow-sm after:absolute after:bottom-0 after:inset-x-0 after:h-1 after:bg-[#980000]"
                    : "border-[#980000] hover:bg-[#980000]/5 bg-white text-[#4D4C4C]"
                }`}
              >
                <span className="text-xs font-semibold block mb-1 truncate max-w-[105px]">
                  {variant.title}
                </span>
                <span className="text-sm font-extrabold text-[#382C2C]">
                  {priceDisplay}
                </span>
              </button>
            )
          })}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollFormats("right")}
            aria-label="Next formats"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 border border-[#980000]/30 text-[#980000] shadow-md hover:bg-white flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
