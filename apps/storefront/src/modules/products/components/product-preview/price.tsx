import { clx } from "@modules/common/components/ui"
import { VariantPrice } from "types/global"

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      {price.price_type === "sale" && (
        <span
          className="line-through text-xs font-medium text-gray-400 whitespace-nowrap"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className={clx("text-base font-extrabold text-[#382C2C] whitespace-nowrap", {
          "text-[#980000]": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </div>
  )
}
