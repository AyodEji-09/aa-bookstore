import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import AddToCartButton from "./add-to-cart-button"
import WishlistHeartButton from "./wishlist-heart-button"

export default function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region?: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const firstVariantId = product.variants?.[0]?.id

  return (
    <div className="group flex flex-col justify-between h-full bg-white">
      <div>
        {/* Book Cover Image */}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="block relative overflow-hidden rounded-lg mb-2.5 sm:mb-4"
        >
          <div className="aspect-[3/4] w-full relative overflow-hidden rounded-lg bg-slate-900 shadow-md flex items-center justify-center">
            {product.thumbnail || product.images?.length ? (
              <Thumbnail
                thumbnail={product.thumbnail}
                images={product.images}
                size="full"
                isFeatured={isFeatured}
              />
            ) : (
              <div className="p-4 text-center text-white">
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-80 mb-2">
                  {product.collection?.title || "ERIC-EMANUEL SCHMITT"}
                </p>
                <h4 className="font-extrabold text-lg leading-snug tracking-tight text-amber-300">
                  {product.title}
                </h4>
              </div>
            )}
          </div>
        </LocalizedClientLink>

        {/* Title & Author */}
        <div className="space-y-0.5 mb-1.5 sm:mb-2">
          <LocalizedClientLink href={`/products/${product.handle}`}>
            <h3 className="font-bold text-base text-[#382C2C] group-hover:text-[#980000] transition-colors line-clamp-1">
              {product.title}
            </h3>
          </LocalizedClientLink>
          <p className="text-xs text-gray-500 line-clamp-1">
            {(product.metadata?.author as string) ||
              product.subtitle ||
              "Ayodeji Anifowose"}
          </p>
        </div>

        {/* Price & Wishlist Heart */}
        <div className="flex items-center justify-between gap-x-1.5 my-2">
          <div className="flex-1 min-w-0 text-base font-extrabold text-[#382C2C]">
            {cheapestPrice ? (
              <PreviewPrice price={cheapestPrice} />
            ) : (
              <span className="whitespace-nowrap">$19.99</span>
            )}
          </div>
          <div className="shrink-0">
            <WishlistHeartButton productId={product.id || ""} />
          </div>
        </div>
      </div>

      {/* Add To Cart Button */}
      <div className="mt-2">
        <AddToCartButton
          variantId={firstVariantId}
          countryCode={region?.countries?.[0]?.iso_2 || "us"}
        />
      </div>
    </div>
  )
}
