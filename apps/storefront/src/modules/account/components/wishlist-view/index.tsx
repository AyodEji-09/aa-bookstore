"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Sparkles, ArrowRight, Trash2, ShoppingBag, BookOpen } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { WishlistItem } from "@lib/data/wishlist"
import { useWishlist } from "@lib/context/wishlist-context"
import { addToCart } from "@lib/data/cart"

export default function WishlistView({
  initialItems = [],
  countryCode,
}: {
  initialItems?: WishlistItem[]
  countryCode: string
}) {
  const { wishlistItems, wishlistProductIds, removeFromWishlist } = useWishlist()
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addSuccessId, setAddSuccessId] = useState<string | null>(null)

  // Merge server initial items with client context items
  const displayItems = wishlistItems.length > 0 ? wishlistItems : initialItems

  // Filter display items to only those that are currently wishlisted
  const activeItems = displayItems.filter(
    (item) => item.product && wishlistProductIds.has(item.product_id)
  )

  const handleAddToCart = async (item: WishlistItem) => {
    const variantId = item.variant_id || item.product?.variants?.[0]?.id
    if (!variantId) return

    setAddingId(item.id)
    try {
      await addToCart({
        variantId,
        quantity: 1,
        countryCode,
      })
      setAddSuccessId(item.id)
      setTimeout(() => setAddSuccessId(null), 2000)
    } catch (err) {
      console.error("Failed to add wishlisted book to cart", err)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="w-full space-y-8" data-testid="wishlist-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-[#980000] text-[#980000]" />
            <h1 className="text-2xl font-extrabold text-[#382C2C] tracking-tight">
              My Wishlist
            </h1>
          </div>
          <p className="text-xs text-[#4D4C4C] mt-1">
            Books and audiobooks you have saved for later.
          </p>
        </div>

        {activeItems.length > 0 && (
          <span className="text-xs font-semibold px-3 py-1 bg-red-50 text-[#980000] rounded-full border border-[#980000]/20 self-start sm:self-center">
            {activeItems.length} {activeItems.length === 1 ? "Book" : "Books"} Saved
          </span>
        )}
      </div>

      {/* Grid of Wishlist Items */}
      {activeItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeItems.map((item) => {
            const product = item.product!
            const isAdding = addingId === item.id
            const isSuccess = addSuccessId === item.id

            return (
              <div
                key={item.id || item.product_id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between group relative"
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-[#980000] hover:bg-white shadow-sm transition-all"
                  title="Remove from wishlist"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  {/* Book Cover */}
                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    className="block relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 mb-4"
                  >
                    {product.thumbnail ? (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <BookOpen className="w-12 h-12 stroke-[1.5]" />
                      </div>
                    )}
                  </LocalizedClientLink>

                  {/* Metadata */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#980000]">
                      {product.category || "Book"}
                    </p>
                    <LocalizedClientLink href={`/products/${product.handle}`}>
                      <h3 className="text-sm font-bold text-[#382C2C] line-clamp-1 group-hover:text-[#980000] transition-colors">
                        {product.title}
                      </h3>
                    </LocalizedClientLink>
                    <p className="text-xs text-[#4D4C4C] font-medium line-clamp-1">
                      {product.author || product.subtitle || "Ayodeji Anifowose"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    disabled={isAdding}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#980000] hover:bg-[#800000] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {isAdding
                        ? "Adding..."
                        : isSuccess
                        ? "Added to Cart!"
                        : "Add to Cart"}
                    </span>
                  </button>

                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-[#980000] hover:text-[#980000] transition-colors"
                    title="View details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </LocalizedClientLink>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-gray-50/70 border border-dashed border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#980000] flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-bold text-[#382C2C]">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-[#4D4C4C] mt-2 max-w-sm leading-relaxed">
            Click the heart icon on any book you love to save it here for later.
          </p>
          <LocalizedClientLink
            href="/store"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#980000] hover:bg-[#800000] text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>Explore Book Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
