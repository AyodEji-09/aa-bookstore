"use client"

import { useState } from "react"
import { Heart, Minus, Plus } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { addToCart } from "@lib/data/cart"

type ProductPurchaseProps = {
  product: HttpTypes.StoreProduct
  selectedVariantId?: string
  countryCode: string
  selectedVariantPrice: any
}

export default function ProductPurchase({
  product,
  selectedVariantId,
  countryCode,
  selectedVariantPrice,
}: ProductPurchaseProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleAddToCart = async () => {
    const variantIdToUse = selectedVariantId || product.variants?.[0]?.id
    if (!variantIdToUse) return
    setIsAdding(true)
    try {
      await addToCart({
        variantId: variantIdToUse,
        quantity,
        countryCode,
      })
    } catch (err) {
      console.error("Failed to add to cart:", err)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      {/* Quantity Selector (preserved commented out per user request) */}
      {/* <div className="flex items-center gap-x-4 pt-2"> */}
      {/*   <button */}
      {/*     onClick={() => setQuantity((q) => Math.max(1, q - 1))} */}
      {/*     className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#980000] hover:text-[#980000] transition-colors" */}
      {/*   > */}
      {/*     <Minus className="w-3.5 h-3.5" /> */}
      {/*   </button> */}
      {/*   <span className="text-sm font-bold text-[#382C2C] w-6 text-center"> */}
      {/*     {quantity} */}
      {/*   </span> */}
      {/*   <button */}
      {/*     onClick={() => setQuantity((q) => q + 1)} */}
      {/*     className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#980000] hover:text-[#980000] transition-colors" */}
      {/*   > */}
      {/*     <Plus className="w-3.5 h-3.5" /> */}
      {/*   </button> */}
      {/* </div> */}

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
        <div className="flex items-center gap-x-4 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={
              isAdding || (!selectedVariantId && !product.variants?.[0]?.id)
            }
            className="flex-1 py-3 px-8 bg-[#980000] hover:bg-[#7a0000] text-white text-sm font-bold rounded transition-colors shadow-sm disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add to cart"}
          </button>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex-1 py-3 px-8 border text-sm font-bold rounded transition-colors flex items-center justify-center gap-x-2 ${
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
    </>
  )
}
