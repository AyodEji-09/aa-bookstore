"use client"

import { useState } from "react"
import { addToCart } from "@lib/data/cart"
import { ShoppingCart } from "lucide-react"

type AddToCartButtonProps = {
  variantId?: string
  countryCode: string
}

export default function AddToCartButton({
  variantId,
  countryCode,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variantId) return

    setIsAdding(true)
    try {
      await addToCart({
        variantId,
        quantity: 1,
        countryCode,
      })
    } catch (err) {
      console.error("Failed to add item to cart:", err)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || !variantId}
      className="w-full py-2.5 px-4 bg-[#980000] hover:bg-[#7a0000] text-white text-xs font-bold rounded-md flex items-center justify-center gap-x-2 transition-colors disabled:opacity-50 shadow-sm"
    >
      <ShoppingCart className="w-4 h-4" />
      <span>{isAdding ? "Adding..." : "Add to cart"}</span>
    </button>
  )
}
