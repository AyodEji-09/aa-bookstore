"use client"

import { useState, useRef, useEffect } from "react"
import { addToCart } from "@lib/data/cart"
import { Check, X } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { getPricesForVariant } from "@lib/util/get-product-price"
import { isDigitalVariant } from "@lib/util/is-digital"
import MobileFormatDrawer from "./mobile-format-drawer"
import { useCart } from "@lib/context/cart-context"

type AddToCartButtonProps = {
  product?: HttpTypes.StoreProduct
  variants?: HttpTypes.StoreProductVariant[]
  countryCode: string
}

const isVariantInStock = (v: HttpTypes.StoreProductVariant) => {
  if (isDigitalVariant(v)) return true
  if (!v.manage_inventory) return true
  if (v.allow_backorder) return true
  return (v.inventory_quantity ?? 0) > 0
}

export default function AddToCartButton({
  product,
  variants = [],
  countryCode,
}: AddToCartButtonProps) {
  const initialVariant = variants.find(isVariantInStock) || variants[0]
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    initialVariant?.id || ""
  )
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isDesktopPopupOpen, setIsDesktopPopupOpen] = useState(false)
  const [isAddingId, setIsAddingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { notifyItemAdded, notifyItemRemoved } = useCart()

  const hasMultipleVariants = variants.length > 1
  const singleVariant = variants[0]

  useEffect(() => {
    if (isDesktopPopupOpen) {
      const active = variants.find(isVariantInStock) || variants[0]
      if (active?.id) {
        setSelectedVariantId(active.id)
      }
    }
  }, [isDesktopPopupOpen, variants])

  // Close desktop overlay on click outside
  useEffect(() => {
    if (!isDesktopPopupOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsDesktopPopupOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDesktopPopupOpen])

  const handleAddVariant = async (variantId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!variantId || isAddingId) return

    setIsAddingId(variantId)

    // Immediate optimistic update (0ms perceived latency)
    notifyItemAdded(1)
    setSuccessId(variantId)
    setTimeout(() => {
      setSuccessId(null)
      setIsDesktopPopupOpen(false)
      setIsMobileDrawerOpen(false)
    }, 700)

    try {
      await addToCart({
        variantId,
        quantity: 1,
        countryCode,
      })
    } catch (err) {
      // Revert optimistic count on failure
      notifyItemRemoved(1)
      console.error("Failed to add item to cart:", err)
    } finally {
      setIsAddingId(null)
    }
  }

  const handleMainButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (hasMultipleVariants) {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsMobileDrawerOpen(true)
      } else {
        setIsDesktopPopupOpen((prev) => !prev)
      }
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
        className="w-full py-2.5 px-3 bg-[#980000] hover:bg-[#7a0000] active:scale-[0.99] text-white text-xs font-bold rounded-md gap-x-1.5 transition-all disabled:opacity-50 shadow-sm"
        aria-expanded={isDesktopPopupOpen || isMobileDrawerOpen}
      >
        <span className="truncate">
          {isAddingId && !hasMultipleVariants ? "Adding..." : "Add to cart"}
        </span>
      </button>

      {/* Desktop In-Card Format Selector Overlay (Hidden on Mobile) */}
      {hasMultipleVariants && isDesktopPopupOpen && (
        <div
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className="hidden md:block absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200/90 p-2.5 z-30 animate-in fade-in zoom-in-95 duration-150"
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
                setIsDesktopPopupOpen(false)
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
              const priceData = getPricesForVariant(
                v as unknown as Parameters<typeof getPricesForVariant>[0]
              )
              const isDigital = isDigitalVariant(v)
              const variantInStock = isVariantInStock(v)
              const isSelected = v.id === selectedVariantId
              const isAddingThis = isAddingId === v.id
              const isSuccessThis = successId === v.id

              return (
                <button
                  key={v.id}
                  onClick={(e) => {
                    setSelectedVariantId(v.id)
                    handleAddVariant(v.id, e)
                  }}
                  onMouseEnter={() => {
                    if (variantInStock) {
                      setSelectedVariantId(v.id)
                    }
                  }}
                  disabled={!!isAddingId || !variantInStock}
                  type="button"
                  className={`relative overflow-hidden w-full flex items-center justify-between gap-2 px-3 py-2.5 border text-left transition-all group ${
                    isSelected
                      ? variantInStock
                        ? "border-[#980000] bg-[#980000]/5 text-[#382C2C] font-semibold shadow-sm after:absolute after:bottom-0 after:inset-x-0 after:h-1 after:bg-[#980000]"
                        : "border-gray-200 bg-[#980000]/5 text-gray-400 font-normal cursor-not-allowed select-none"
                      : variantInStock
                      ? "border-[#980000] hover:bg-[#980000]/5 bg-white text-[#4D4C4C] font-semibold active:scale-[0.98] cursor-pointer"
                      : "border-gray-200 bg-gray-50/80 text-gray-400 font-normal cursor-not-allowed select-none"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-xs truncate ${
                        isSelected
                          ? "font-semibold text-[#382C2C]"
                          : variantInStock
                          ? "font-semibold text-[#4D4C4C] group-hover:text-[#980000]"
                          : "text-gray-400 font-normal"
                      }`}
                    >
                      {v.title || (isDigital ? "Digital" : "Standard")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {priceData?.calculated_price && (
                      <span
                        className={`text-xs ${
                          isSelected
                            ? "font-extrabold text-[#382C2C]"
                            : variantInStock
                            ? "font-extrabold text-[#382C2C] group-hover:text-[#980000]"
                            : "text-gray-400 font-normal"
                        }`}
                      >
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

                  {/* Diagonal Strikethrough for Out of Stock */}
                  {!variantInStock && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      preserveAspectRatio="none"
                    >
                      <line
                        x1="0"
                        y1="100%"
                        x2="100%"
                        y2="0"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet Drawer */}
      {hasMultipleVariants && (
        <MobileFormatDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          product={product}
          variants={variants}
          countryCode={countryCode}
          onAddToCart={handleAddVariant}
          isAddingId={isAddingId}
          successId={successId}
        />
      )}
    </div>
  )
}
