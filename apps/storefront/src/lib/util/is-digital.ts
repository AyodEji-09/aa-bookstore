import { HttpTypes } from "@medusajs/types"

export function isDigitalItem(
  item?: (HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem) & {
    variant_title?: string
    variant?: {
      metadata?: Record<string, unknown> | null
      product?: { metadata?: Record<string, unknown> | null }
    }
  }
): boolean {
  if (!item) return false
  const title = (item.variant_title || item.title || "").toLowerCase()
  const metadata: Record<string, unknown> = {
    ...(item.variant?.product?.metadata || {}),
    ...(item.variant?.metadata || {}),
    ...(item.metadata || {}),
  }
  return (
    title.includes("ebook") ||
    title.includes("e-book") ||
    title.includes("audiobook") ||
    title.includes("audio book") ||
    metadata.format === "ebook" ||
    metadata.format === "audiobook" ||
    metadata.is_digital === true
  )
}

export function isDigitalVariant(
  variant?: HttpTypes.StoreProductVariant & {
    product?: { metadata?: Record<string, unknown> | null }
  }
): boolean {
  if (!variant) return false
  const title = (variant.title || "").toLowerCase()
  const metadata = {
    ...(variant.product?.metadata || {}),
    ...(variant.metadata || {}),
  }
  return (
    title.includes("ebook") ||
    title.includes("e-book") ||
    title.includes("audiobook") ||
    title.includes("audio book") ||
    metadata.format === "ebook" ||
    metadata.format === "audiobook" ||
    metadata.is_digital === true
  )
}

export function isDigitalCart(cart?: HttpTypes.StoreCart | null): boolean {
  if (!cart?.items?.length) return false
  return cart.items.every(isDigitalItem)
}

