import { clx } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
  className,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  className?: string
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse rounded" />
  }

  return (
    <div className={clx("flex flex-col", className)}>
      <div className="flex items-baseline gap-x-2.5">
        <span
          className={clx("text-2xl font-extrabold text-[#382C2C]", {
            "text-[#980000]": selectedPrice.price_type === "sale",
          })}
        >
          {!variant && "From "}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
          >
            {selectedPrice.calculated_price}
          </span>
        </span>

        {selectedPrice.price_type === "sale" && (
          <div className="flex items-center gap-x-1.5 text-xs font-medium">
            <span
              className="text-gray-400 line-through"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
            <span className="text-[#980000] font-semibold bg-red-50 px-1.5 py-0.5 rounded text-[11px]">
              -{selectedPrice.percentage_diff}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
