import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@modules/common/components/ui"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  return (
    <Table.Row className="w-full hover:bg-transparent" data-testid="product-row">
      <Table.Cell className="!pl-0 py-3.5">
        <div className="flex items-center gap-x-3 sm:gap-x-3.5">
          <div className="w-14 sm:w-16 shrink-0 rounded-md overflow-hidden bg-ui-bg-subtle border border-ui-border-base/50">
            <Thumbnail thumbnail={item.thumbnail} size="square" />
          </div>
          <div className="flex flex-col min-w-0">
            <Text
              className="txt-medium-plus text-ui-fg-base line-clamp-2"
              data-testid="product-name"
            >
              {item.product_title}
            </Text>
            <LineItemOptions variant={item.variant} data-testid="product-variant" />
          </div>
        </div>
      </Table.Cell>

      <Table.Cell className="!pr-0 text-right align-middle">
        <span className="!pr-0 flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1">
            <Text className="text-ui-fg-muted">
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
            </Text>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>

          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
