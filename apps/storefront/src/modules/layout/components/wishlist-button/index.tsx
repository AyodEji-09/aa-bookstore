"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useWishlist } from "@lib/context/wishlist-context"
import { Heart } from "lucide-react"

export default function WishlistButton({
  variant = "default",
}: {
  variant?: "default" | "topbar"
}) {
  const { wishlistCount } = useWishlist()

  if (variant === "topbar") {
    return (
      <LocalizedClientLink
        className="flex items-center gap-x-1.5 text-xs text-white/80 hover:text-white transition-colors relative py-1"
        href="/account/wishlist"
        data-testid="topbar-wishlist-link"
        title="Wishlist"
      >
        <div className="relative flex items-center">
          <Heart className="w-3.5 h-3.5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#980000] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm">
              {wishlistCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline text-[11px] font-medium text-white/90">
          Wishlist
        </span>
      </LocalizedClientLink>
    )
  }

  return (
    <LocalizedClientLink
      className="w-9 h-9 rounded-full border border-gray-200 text-[#382C2C] flex items-center justify-center relative hover:border-[#980000] hover:text-[#980000] transition-colors"
      href="/account/wishlist"
      data-testid="nav-wishlist-link"
      title="Wishlist"
    >
      <Heart className="w-4 h-4" />
      {wishlistCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#980000] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
          {wishlistCount}
        </span>
      )}
    </LocalizedClientLink>
  )
}
