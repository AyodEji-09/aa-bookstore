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
    ((item as any).product?.metadata?.author as string) ||
    "Ayodeji Anifowose"

  if (type === "full") {
    return (
      <div
        className="py-6 sm:py-8 flex items-start justify-between gap-4 sm:gap-6 border-b border-gray-100 last:border-b-0"
        data-testid="product-row"
      >
        <div className="flex items-start gap-4 sm:gap-6 flex-1 min-w-0">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className="w-24 h-28 sm:w-28 sm:h-32 bg-[#f4f4f5]/70 rounded-xl overflow-hidden flex items-center justify-center shrink-0 p-2 hover:opacity-90 transition-opacity"
          >
            <Thumbnail
              thumbnail={item.thumbnail}
              images={item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm sm:text-base text-gray-900 tracking-tight">
              {author}
            </p>

            <LocalizedClientLink href={`/products/${item.product_handle}`}>
              <p
                className="text-sm sm:text-base text-gray-600 font-normal mt-0.5 hover:text-gray-900 transition-colors line-clamp-2"
                data-testid="product-title"
              >
                {item.product_title}
              </p>
            </LocalizedClientLink>

            <div className="flex items-baseline gap-2 mt-2 font-medium">
              <span
                className={clx(
                  "text-base sm:text-lg font-bold",
                  hasReducedPrice ? "text-red-600" : "text-gray-900"
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
                  className="text-sm text-gray-400 line-through"
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
              className="text-xs sm:text-sm text-gray-500 space-y-0.5 mt-2"
              data-testid="product-variant"
            >
              <div>
                <span className="text-gray-500">Format: </span>
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
                    <span className="text-gray-500">
                      {opt.option?.title || "Option"}:{" "}
                    </span>
                    <span className="text-gray-700 font-medium">
                      {opt.value}
                    </span>
                  </div>
                ))}
            </div>

            <button
              type="button"
              onClick={handleMoveToFavourites}
              disabled={isMoving}
              className="underline text-xs sm:text-sm text-gray-900 hover:text-gray-600 font-medium cursor-pointer transition-colors mt-4 inline-block text-left disabled:opacity-50"
            >
              {isMoving ? "Moving to favourites..." : "Move to favourites"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0 self-start pt-0.5">
          {isDigital ? (
            <div className="h-10 px-3 min-w-[56px] border border-black rounded-[2px] flex items-center justify-center text-sm font-medium text-gray-900 bg-white">
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
                className="appearance-none h-10 pl-3 pr-7 min-w-[60px] border border-black rounded-[2px] text-sm font-medium text-gray-900 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
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
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-900">
                <ChevronDown size="12" />
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Remove item"
            className="p-1 text-gray-700 hover:text-black transition-colors cursor-pointer disabled:opacity-50"
            data-testid="product-delete-button"
          >
            {isDeleting ? (
              <Spinner className="animate-spin w-5 h-5 text-gray-700" />
            ) : (
              <X size="22" color="currentColor" />
            )}
          </button>
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
