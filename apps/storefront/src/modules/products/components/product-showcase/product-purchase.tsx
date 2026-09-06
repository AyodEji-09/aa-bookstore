"use client"

import { useState, useEffect } from "react"
import { Heart, BookOpen, Headphones } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { addToCart } from "@lib/data/cart"
import { isDigitalVariant } from "@lib/util/is-digital"
import { listLibraryItems } from "@lib/data/library"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductPurchaseProps = {
  product: HttpTypes.StoreProduct
  selectedVariantId?: string
  countryCode: string
  selectedVariantPrice: {
    calculated_price?: string
    original_price?: string
  } | null
}

export default function ProductPurchase({
  product,
  selectedVariantId,
  countryCode,
  selectedVariantPrice,
}: ProductPurchaseProps) {
  const [quantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [ownedFormats, setOwnedFormats] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    listLibraryItems()
      .then((items) => {
        if (!isMounted) return
        const owned = items
          .filter((item) => item.product?.id === product.id)
          .map((item) => item.format)
        setOwnedFormats(owned)
      })
      .catch(() => {})
    return () => {
      isMounted = false
    }
  }, [product.id])

  const selectedVariant =
    product.variants?.find((v) => v.id === selectedVariantId) ||
    product.variants?.[0]
  const isDigital = isDigitalVariant(selectedVariant)

  const variantFormat =
    (selectedVariant?.metadata?.format as string) ||
    (selectedVariant?.title?.toLowerCase().includes("audio")
      ? "audiobook"
      : "ebook")

  const isAlreadyOwned = isDigital && ownedFormats.includes(variantFormat)

  const handleAddToCart = async () => {
    const variantIdToUse = selectedVariantId || product.variants?.[0]?.id
    if (!variantIdToUse) return

    if (isAlreadyOwned) {
      setErrorMessage("You already own this digital book in your library.")
      return
    }

    setIsAdding(true)
    setErrorMessage(null)
    try {
      await addToCart({
        variantId: variantIdToUse,
        quantity: isDigital ? 1 : quantity,
        countryCode,
      })
    } catch (err: unknown) {
      const error = err as Error
      setErrorMessage(error.message || "Failed to add to cart")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      {/* Price and Actions */}
      <div>
        <div className="text-2xl font-extrabold text-[#382C2C]">
          {selectedVariantPrice ? (
            <span>{selectedVariantPrice.calculated_price}</span>
          ) : (
            <span>-</span>
          )}
        </div>

        {/* Add to Cart & Favorite Action Buttons */}
        <div className="flex flex-col gap-y-2 pt-2">
          {errorMessage && (
            <p className="text-xs text-[#980000] font-medium">{errorMessage}</p>
          )}

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-x-4">
            {isAlreadyOwned ? (
              <LocalizedClientLink
                href="/account/library"
                className="w-full sm:flex-1 py-3 px-6 bg-[#382C2C] hover:bg-[#201a1a] text-white text-sm font-bold rounded transition-colors shadow-sm flex items-center justify-center gap-x-2 text-center"
              >
                <span>
                  Already in Library •{" "}
                  {variantFormat === "audiobook" ? "Listen Now" : "Read Now"}
                </span>
              </LocalizedClientLink>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={
                  isAdding || (!selectedVariantId && !product.variants?.[0]?.id)
                }
                className="w-full sm:flex-1 py-3 px-8 bg-[#980000] hover:bg-[#7a0000] text-white text-sm font-bold rounded transition-colors shadow-sm disabled:opacity-50 text-center"
              >
                {isAdding ? "Adding..." : "Add to cart"}
              </button>
            )}

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-full sm:flex-1 py-3 px-8 border text-sm font-bold rounded transition-colors flex items-center justify-center gap-x-2 ${
                isFavorite
                  ? "border-[#980000] bg-[#980000]/10 text-[#980000]"
                  : "border-[#980000] text-[#980000] hover:bg-[#980000]/5"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-[#980000]" : ""}`}
              />
              <span>Favorite</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
