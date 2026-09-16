"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, ArrowRight, Trash2, ShoppingBag, BookOpen } from "lucide-react"
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
    <div className="w-full" data-testid="wishlist-view">
      {/* Header matching dashboard style */}
      <div className="mb-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl-semi">Wishlist</h1>
          {activeItems.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 text-[#980000] rounded-md border border-[#980000]/20">
              {activeItems.length} {activeItems.length === 1 ? "Item" : "Items"} Saved
            </span>
          )}
        </div>
        <p className="text-base-regular">
          Books and audiobooks you have saved for later. View and manage your saved items.
        </p>
      </div>

      {/* Grid of Wishlist Items */}
      {activeItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6">
          {activeItems.map((item) => {
            const product = item.product!
            const isAdding = addingId === item.id
            const isSuccess = addSuccessId === item.id

            return (
              <div
                key={item.id || item.product_id}
                className="group flex flex-col justify-between h-full bg-white relative"
              >
                <div>
                  {/* Book Cover Image */}
                  <div className="block relative overflow-hidden rounded-lg mb-2.5 sm:mb-3">
                    <LocalizedClientLink
                      href={`/products/${product.handle}`}
                      className="block aspect-[3/4] w-full relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center"
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
                          <BookOpen className="w-10 h-10 stroke-[1.5]" />
                        </div>
                      )}
                    </LocalizedClientLink>

                    {/* Quick Remove Button Overlay */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeFromWishlist(item.product_id)
                      }}
                      className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/95 backdrop-blur-sm text-gray-400 hover:text-[#980000] hover:bg-white shadow-sm transition-colors"
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Author */}
                  <div className="space-y-0.5 mb-2">
                    <LocalizedClientLink href={`/products/${product.handle}`}>
                      <h3 className="font-bold text-sm sm:text-base text-[#382C2C] group-hover:text-[#980000] transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                    </LocalizedClientLink>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {product.author || product.subtitle || "Ayodeji Anifowose"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    disabled={isAdding}
                    className="flex-1 py-2.5 px-3 bg-[#980000] hover:bg-[#7a0000] active:scale-[0.99] text-white text-xs font-bold rounded-md flex items-center justify-center gap-x-1.5 transition-all disabled:opacity-50"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
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
                    className="p-2.5 rounded-md border border-gray-200 text-gray-600 hover:border-[#980000] hover:text-[#980000] transition-colors"
                    title="View details"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </LocalizedClientLink>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-dashed border-gray-200 rounded-lg p-12 text-center flex flex-col items-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-50 text-[#980000] flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h3 className="text-base-semi text-[#382C2C]">
            Your wishlist is currently empty
          </h3>
          <p className="text-small-regular text-gray-500 mt-2 max-w-sm leading-relaxed">
            Click the heart icon on any book you love to save it here for later.
          </p>
          <LocalizedClientLink
            href="/store"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#980000] hover:bg-[#7a0000] text-white text-xs font-bold transition-colors"
          >
            <span>Explore Book Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
