import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LIBRARY_MODULE } from "../modules/library"
import LibraryModuleService from "../modules/library/service"

export default async function orderPlacedDigitalEntitlementHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const libraryService: LibraryModuleService = container.resolve(LIBRARY_MODULE)

  const orderId = data.id

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "customer_id",
        "items.*",
        "items.variant.*",
        "items.variant.product.*",
      ],
      filters: {
        id: orderId,
      },
    })

    const order = orders?.[0]
    if (!order || !order.customer_id || !order.items?.length) {
      return
    }

    for (const item of order.items) {
      if (!item) continue
      const variantTitle = (item.variant_title || item.title || "").toLowerCase()
      const variant = item.variant
      const metadata = {
        ...(variant?.product?.metadata || {}),
        ...(variant?.metadata || {}),
        ...(item.metadata || {}),
      }

      let format: "ebook" | "audiobook" | null = null
      if (
        metadata.format === "ebook" ||
        metadata.is_ebook ||
        variantTitle.includes("ebook") ||
        variantTitle.includes("e-book")
      ) {
        format = "ebook"
      } else if (
        metadata.format === "audiobook" ||
        metadata.is_audiobook ||
        variantTitle.includes("audiobook") ||
        variantTitle.includes("audio")
      ) {
        format = "audiobook"
      }

      if (format && item.product_id) {
        const existing = await libraryService.listCustomerLibraryItems({
          customer_id: order.customer_id,
          product_id: item.product_id,
          format,
        })

        if (!existing.length) {
          await libraryService.createCustomerLibraryItems({
            customer_id: order.customer_id,
            product_id: item.product_id,
            variant_id: item.variant_id ?? "",
            format,
            order_id: order.id,
            progress: {
              last_chapter: 1,
              completed: false,
              timestamp_seconds: 0,
            },
            media_key: (metadata.media_key as string) ?? null,
          })

          logger.info(
            `Granted ${format} entitlement for product ${item.product_id} to customer ${order.customer_id}`
          )
        }
      }
    }
  } catch (error) {
    logger.error(
      `Failed to process digital entitlements for order ${orderId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
