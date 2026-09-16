import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@modules/common/components/ui"
import Item from "@modules/cart/components/item"
import SkeletonCartItem from "@modules/skeletons/components/skeleton-cart-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  const totalCount = items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0

  return (
    <div className="w-full">
      <div className="pb-2 flex items-baseline justify-between">
        <div className="flex items-baseline gap-x-2.5">
          <Heading level="h2" className="text-2xl sm:text-[2rem] sm:leading-[2.75rem] font-bold text-ui-fg-base">
            Cart
          </Heading>
          {items && items.length > 0 && (
            <span className="text-xs sm:text-sm text-ui-fg-muted font-medium">
              ({totalCount} {totalCount === 1 ? "item" : "items"})
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col divide-y divide-ui-border-base" data-testid="cart-items-container">
        {items
          ? items
              .sort((a, b) => {
                return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
              })
              .map((item) => {
                return (
                  <Item
                    key={item.id}
                    item={item}
                    currencyCode={cart?.currency_code}
                  />
                )
              })
          : repeat(3).map((i) => {
              return <SkeletonCartItem key={i} />
            })}
      </div>
    </div>
  )
}

export default ItemsTemplate
