"use client"

import { Table, Text } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { isDigitalItem } from "@lib/util/is-digital"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  if (type === "preview") {
    return (
      <Table.Row className="w-full" data-testid="product-row">
        <Table.Cell className="!pl-0 p-4 w-24">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className="flex w-16"
          >
            <Thumbnail
              thumbnail={item.thumbnail}
              images={item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>
        </Table.Cell>

        <Table.Cell className="text-left">
          <Text
            className="txt-medium-plus text-ui-fg-base"
            data-testid="product-title"
          >
            {item.product_title}
          </Text>
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
        </Table.Cell>

        <Table.Cell className="!pr-0">
          <span className="flex flex-col items-end h-full justify-center !pr-0">
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
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

  return (
    <div
      className="py-4 sm:py-5 flex flex-col gap-y-3 sm:gap-y-4"
      data-testid="product-row"
    >
      {/* Top: Image and Details (Title, Variant, Price) */}
      <div className="flex gap-3.5 sm:gap-5 items-start">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="w-20 sm:w-24 shrink-0 rounded-md overflow-hidden bg-ui-bg-subtle hover:opacity-90 transition-opacity border border-ui-border-base/50"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>

        <div className="min-w-0 flex-1 space-y-1">
          <LocalizedClientLink href={`/products/${item.product_handle}`}>
            <Text
              className="txt-medium-plus sm:text-base font-semibold text-ui-fg-base hover:text-ui-fg-interactive transition-colors line-clamp-2"
              data-testid="product-title"
            >
              {item.product_title}
            </Text>
          </LocalizedClientLink>
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
          <div className="pt-0.5 w-fit [&>div]:items-start">
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </div>
        </div>
      </div>

      {/* Bottom: Quantity and Remove under the image and text */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2">
          {isDigitalItem(item) ? (
            <span className="h-9 px-3 flex items-center justify-center text-xs font-medium text-ui-fg-subtle border border-ui-border-base rounded-md bg-ui-bg-subtle">
              Digital Edition &bull; Qty 1
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ui-fg-subtle hidden sm:inline">
                Qty:
              </span>
              <CartItemSelect
                value={item.quantity}
                onChange={(value) =>
                  changeQuantity(parseInt(value.target.value))
                }
                className="w-16 h-9"
                disabled={updating}
                data-testid="product-select-button"
              >
                {Array.from(
                  {
                    length: Math.min(maxQuantity, 10),
                  },
                  (_, i) => (
                    <option value={i + 1} key={i}>
                      {i + 1}
                    </option>
                  )
                )}
              </CartItemSelect>
            </div>
          )}
          {updating && <Spinner className="w-4 h-4 text-ui-fg-subtle" />}
        </div>

        <DeleteButton
          id={item.id}
          data-testid="product-delete-button"
          className="text-xs text-ui-fg-muted hover:text-ui-fg-danger transition-colors cursor-pointer"
        >
          <span className="text-xs">Remove</span>
        </DeleteButton>
      </div>

      <ErrorMessage error={error} data-testid="product-error-message" />
    </div>
  )
}

export default Item
