"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

export default function WishlistHeartButton({
  productId,
}: {
  productId: string
}) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  return (
    <button
      onClick={toggleWishlist}
      type="button"
      className="p-1 transition-colors"
      title="Add to Wishlist"
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isWishlisted
            ? "fill-[#980000] text-[#980000]"
            : "text-[#980000] hover:text-[#980000]"
        }`}
      />
    </button>
  )
}
