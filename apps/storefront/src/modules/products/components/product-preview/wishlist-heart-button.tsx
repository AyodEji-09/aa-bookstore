"use client"

import { Heart } from "lucide-react"
import { useWishlist } from "@lib/context/wishlist-context"

export default function WishlistHeartButton({
  productId,
}: {
  productId: string
}) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(productId)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(productId)
  }

  return (
    <button
      onClick={handleToggle}
      type="button"
      className="p-1 transition-transform active:scale-90"
      title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      aria-label={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          wishlisted
            ? "fill-[#980000] text-[#980000]"
            : "text-[#980000] hover:fill-[#980000]/20"
        }`}
      />
    </button>
  )
}
