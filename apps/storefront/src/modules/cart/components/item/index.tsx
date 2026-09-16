"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { addToWishlist } from "@lib/data/wishlist"
import { HttpTypes } from "@medusajs/types"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { isDigitalItem } from "@lib/util/is-digital"
import { convertToLocale } from "@lib/util/money"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"
import { Spinner } from "@medusajs/icons"
import { toast } from "@medusajs/ui"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  const changeQuantity = async (quantity: number) => {
    setUpdating(true)
    try {
      await updateLineItem({
        lineId: item.id,
        quantity,
      })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update quantity"
      )
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteLineItem(item.id)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove item"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMoveToFavourites = async () => {
    setIsMoving(true)
    try {
      const res = await addToWishlist(
        item.product_id,
        item.variant_id || undefined
      )
      if (res.success) {
        await deleteLineItem(item.id)
        toast.success("Moved to favourites")
      } else {
        toast.error("Please sign in to add items to your favourites")
      }
    } catch (_err) {
      toast.error("Failed to move to favourites")
    } finally {
      setIsMoving(false)
    }
  }

  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  const { total, original_total } = item
  const originalPrice = original_total ?? 0
  const currentPrice = total ?? 0
  const hasReducedPrice = currentPrice < originalPrice

  const isDigital = isDigitalItem(item)
  const formatTitle =
    (item.variant?.metadata?.format as string) ||
    item.variant?.title ||
    (isDigital ? "Digital" : "Paperback")

  const author =
    (item.variant?.product?.metadata?.author as string) ||
    ((item as { product?: { metadata?: { author?: string } } }).product
      ?.metadata?.author as string) ||
    "Ayodeji Anifowose"

  if (type === "full") {
    return (
      <div
        className="py-5 sm:py-6 flex gap-3.5 sm:gap-6 items-start border-b border-gray-100 last:border-b-0"
        data-testid="product-row"
      >
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="w-20 h-28 sm:w-24 sm:h-32 bg-[#F6F6F6] rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center shrink-0 p-1.5 hover:opacity-90 transition-opacity"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            className="w-full h-full object-contain"
          />
        </LocalizedClientLink>

        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {author && (
                  <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 truncate">
                    {author}
                  </p>
                )}
                <LocalizedClientLink href={`/products/${item.product_handle}`}>
                  <h3
                    className="text-sm sm:text-base font-semibold text-gray-900 hover:text-[#980000] transition-colors line-clamp-2 mt-0.5 leading-snug"
                    data-testid="product-title"
                  >
                    {item.product_title}
                  </h3>
                </LocalizedClientLink>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="Remove item"
                className="p-1 -mr-1 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                data-testid="product-delete-button"
              >
                {isDeleting ? (
                  <Spinner className="animate-spin w-4 h-4 text-gray-700" />
                ) : (
                  <X size="18" color="currentColor" />
                )}
              </button>
            </div>

            <div className="flex items-baseline gap-2 mt-1.5 font-medium">
              <span
                className={clx(
                  "text-sm sm:text-base font-bold",
                  hasReducedPrice ? "text-[#980000]" : "text-gray-900"
                )}
                data-testid="product-price"
              >
                {convertToLocale({
                  amount: currentPrice,
                  currency_code: currencyCode,
                })}
              </span>
              {hasReducedPrice && (
                <span
                  className="text-xs text-gray-400 line-through"
                  data-testid="product-original-price"
                >
                  {convertToLocale({
                    amount: originalPrice,
                    currency_code: currencyCode,
                  })}
                </span>
              )}
            </div>

            <div
              className="text-xs text-gray-500 space-y-0.5 mt-1.5"
              data-testid="product-variant"
            >
              <div>
                <span className="text-gray-400">Format: </span>
                <span className="text-gray-700 font-medium capitalize">
                  {formatTitle}
                </span>
              </div>
              {item.variant?.options
                ?.filter(
                  (opt) => opt.option?.title?.toLowerCase() !== "format"
                )
                .map((opt) => (
                  <div key={opt.id}>
                    <span className="text-gray-400">
                      {opt.option?.title || "Option"}:{" "}
                    </span>
                    <span className="text-gray-700 font-medium">
                      {opt.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-3 sm:mt-4 pt-2 border-t border-gray-50">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 sm:hidden">Qty:</span>
              {isDigital ? (
                <div className="h-8 px-2.5 min-w-[42px] border border-gray-200 rounded text-xs font-medium text-gray-700 bg-gray-50 flex items-center justify-center">
                  1
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      changeQuantity(parseInt(e.target.value))
                    }
                    disabled={updating}
                    className="appearance-none h-8 pl-2.5 pr-6 min-w-[48px] border border-gray-300 rounded text-xs font-medium text-gray-900 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#980000] focus:border-[#980000] disabled:opacity-50"
                    data-testid="product-select-button"
                  >
                    {Array.from(
                      { length: Math.min(maxQuantity, 10) },
                      (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      )
                    )}
                  </select>
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size="10" />
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleMoveToFavourites}
              disabled={isMoving}
              className="underline text-xs text-gray-500 hover:text-gray-900 font-medium cursor-pointer transition-colors disabled:opacity-50"
            >
              {isMoving ? "Saving..." : "Move to favourites"}
            </button>
          </div>
        </div>
      </div>
    )
  }

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

export default Item
