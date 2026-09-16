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

  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">Cart</Heading>
      </div>
      <div className="flex flex-col" data-testid="cart-items-container">
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
