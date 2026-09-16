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
      <div className="pb-4 sm:pb-5 border-b border-gray-100 flex items-baseline justify-between">
        <Heading className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Cart
        </Heading>
        {items && items.length > 0 && (
          <span className="text-xs sm:text-sm text-gray-500 font-medium">
            {totalCount} {totalCount === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      <div className="divide-y divide-gray-100" data-testid="cart-items-container">
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
