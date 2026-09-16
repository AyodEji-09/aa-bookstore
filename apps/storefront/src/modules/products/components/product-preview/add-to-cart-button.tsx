"use client"

import { useState, useRef, useEffect } from "react"
import { addToCart } from "@lib/data/cart"
import { ShoppingCart, Check, X, BookOpen, Headphones, ChevronDown } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { getPricesForVariant } from "@lib/util/get-product-price"
import { isDigitalVariant } from "@lib/util/is-digital"

type AddToCartButtonProps = {
  variants?: HttpTypes.StoreProductVariant[]
  countryCode: string
}

export default function AddToCartButton({
  variants = [],
  countryCode,
}: AddToCartButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAddingId, setIsAddingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const hasMultipleVariants = variants.length > 1
  const singleVariant = variants[0]

  // Close overlay on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleAddVariant = async (variantId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!variantId || isAddingId) return

    setIsAddingId(variantId)
    try {
      await addToCart({
        variantId,
        quantity: 1,
        countryCode,
      })
      setSuccessId(variantId)
      setTimeout(() => {
        setSuccessId(null)
        setIsOpen(false)
      }, 700)
    } catch (err) {
      console.error("Failed to add item to cart:", err)
    } finally {
      setIsAddingId(null)
    }
  }

  const handleMainButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (hasMultipleVariants) {
      setIsOpen((prev) => !prev)
    } else if (singleVariant?.id) {
      handleAddVariant(singleVariant.id)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Primary Trigger Button */}
      <button
        onClick={handleMainButtonClick}
        disabled={!!isAddingId || (!hasMultipleVariants && !singleVariant?.id)}
        type="button"
        className="w-full py-2.5 px-3 bg-[#980000] hover:bg-[#7a0000] active:scale-[0.99] text-white text-xs font-bold rounded-md flex items-center justify-center gap-x-1.5 transition-all disabled:opacity-50 shadow-sm"
        aria-expanded={isOpen}
      >
        <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">
          {isAddingId && !hasMultipleVariants
            ? "Adding..."
            : hasMultipleVariants
            ? "Choose format"
            : "Add to cart"}
        </span>
        {hasMultipleVariants && (
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* In-Card Format Selector Overlay */}
      {hasMultipleVariants && isOpen && (
        <div
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200/90 p-2.5 z-30 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#382C2C]">
              Select format
            </span>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(false)
              }}
              type="button"
              className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors"
              title="Close"
              aria-label="Close format selector"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of Variants / Formats */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
            {variants.map((v) => {
              const priceData = getPricesForVariant(v as any)
              const isDigital = isDigitalVariant(v)
              const isAudio =
                v.title?.toLowerCase().includes("audio") ||
                (v.metadata?.format as string) === "audiobook"
              const isAddingThis = isAddingId === v.id
              const isSuccessThis = successId === v.id

              return (
                <button
                  key={v.id}
                  onClick={(e) => handleAddVariant(v.id, e)}
                  disabled={!!isAddingId}
                  type="button"
                  className="w-full flex items-center justify-between gap-2 p-2 rounded-md border border-gray-100 bg-gray-50/70 hover:bg-red-50/60 hover:border-red-200 active:scale-[0.98] transition-all text-left group"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isAudio ? (
                      <Headphones className="w-3.5 h-3.5 shrink-0 text-[#980000]" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#980000]" />
                    )}
                    <span className="text-xs font-semibold text-[#382C2C] group-hover:text-[#980000] truncate">
                      {v.title || (isDigital ? "Digital" : "Standard")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {priceData?.calculated_price && (
                      <span className="text-xs font-extrabold text-[#382C2C]">
                        {priceData.calculated_price}
                      </span>
                    )}
                    {isSuccessThis ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in" />
                    ) : isAddingThis ? (
                      <span className="text-[10px] text-[#980000] font-bold animate-pulse">
                        ...
                      </span>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
