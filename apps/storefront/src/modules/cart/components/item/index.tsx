"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { isDigitalItem } from "@lib/util/is-digital"
import { useWishlist } from "@lib/context/wishlist-context"
import { Heart, Minus, Plus } from "lucide-react"
import { Trash } from "@medusajs/icons"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(item.product_id)

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

  const handleDelete = async () => {
    setError(null)
    setIsDeleting(true)

    await deleteLineItem(item.id)
      .catch((err) => {
        setError(err.message)
        setIsDeleting(false)
      })
  }

  const handleDecrement = () => {
    if (item.quantity <= 1) {
      handleDelete()
    } else {
      changeQuantity(item.quantity - 1)
    }
  }

  const handleIncrement = () => {
    if (item.quantity < maxQuantity) {
      changeQuantity(item.quantity + 1)
    }
  }

  const handleWishlistToggle = async () => {
    await toggleWishlist(item.product_id, item.variant_id || undefined)
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory
  const isDigital = isDigitalItem(item)

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

      {/* Bottom: Quantity pill and Wishlist heart under the image and text */}
      <div className="flex items-center gap-3 pt-1">
        {/* Pill Quantity Modifier */}
        <div className="h-9 px-3 bg-ui-bg-subtle rounded-full flex items-center gap-x-3 select-none">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={updating || isDeleting}
            className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors disabled:opacity-40 cursor-pointer p-0.5 flex items-center justify-center"
            aria-label={item.quantity <= 1 ? "Remove item" : "Decrease quantity"}
            data-testid="product-decrement-button"
          >
            {isDeleting ? (
              <Spinner className="w-3.5 h-3.5 animate-spin" />
            ) : item.quantity <= 1 ? (
              <Trash className="w-4 h-4" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
          </button>

          <span
            className="text-xs font-semibold text-ui-fg-base min-w-[16px] text-center"
            data-testid="product-quantity"
          >
            {updating ? <Spinner className="w-3 h-3 animate-spin mx-auto" /> : item.quantity}
          </span>

          {!isDigital && (
            <button
              type="button"
              onClick={handleIncrement}
              disabled={item.quantity >= maxQuantity || updating || isDeleting}
              className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors disabled:opacity-30 cursor-pointer p-0.5 flex items-center justify-center"
              aria-label="Increase quantity"
              data-testid="product-increment-button"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Circular Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className="w-9 h-9 rounded-full bg-ui-bg-subtle hover:bg-ui-bg-field-hover flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          title={wishlisted ? "Remove from favourites" : "Save to favourites"}
          aria-label={wishlisted ? "Remove from favourites" : "Save to favourites"}
          data-testid="product-wishlist-button"
        >
          <Heart
            className={clx("w-4 h-4 transition-colors", {
              "fill-[#980000] text-[#980000]": wishlisted,
              "text-ui-fg-subtle hover:text-ui-fg-base": !wishlisted,
            })}
          />
        </button>
      </div>

      <ErrorMessage error={error} data-testid="product-error-message" />
    </div>
  )
}

export default Item
