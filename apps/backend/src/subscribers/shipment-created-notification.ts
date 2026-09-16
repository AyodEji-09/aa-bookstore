import dns from "node:dns"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"
import { renderShipmentCreatedEmail } from "../modules/resend/templates"

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first")
}

export default async function shipmentCreatedNotificationHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // Respect the admin toggle if send notification was turned off
  if (data.no_notification) {
    logger.info(
      `Shipment notification skipped for fulfillment ${data.id} (no_notification is true)`
    )
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const fulfillmentId = data.id

  try {
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: [
        "id",
        "labels.*",
        "items.*",
        "order.*",
        "order.display_id",
        "order.email",
        "order.shipping_address.*",
      ],
      filters: {
        id: fulfillmentId,
      },
    })

    const fulfillment = fulfillments?.[0]
    let order = (fulfillment as any)?.order

    if (!order || !order.email) {
      const { data: links } = await query.graph({
        entity: "order_fulfillment",
        fields: ["order_id"],
        filters: {
          fulfillment_id: fulfillmentId,
        } as any,
      })
      const orderId = (links?.[0] as any)?.order_id
      if (orderId) {
        const { data: orders } = await query.graph({
          entity: "order",
          fields: [
            "id",
            "display_id",
            "email",
            "shipping_address.*",
            "fulfillments.*",
            "fulfillments.labels.*",
            "fulfillments.items.*",
          ],
          filters: {
            id: orderId,
          },
        })
        order = orders?.[0]
      }
    }

    if (!order || !order.email) {
      logger.warn(
        `Could not find linked order for shipment fulfillment ${fulfillmentId}`
      )
      return
    }

    const customerName =
      `${order.shipping_address?.first_name || ""} ${
        order.shipping_address?.last_name || ""
      }`.trim() || "Reader"

    const labels =
      fulfillment?.labels?.length
        ? fulfillment.labels
        : (order as any)?.fulfillments?.find((f: any) => f.id === fulfillmentId)?.labels || []

    const primaryLabel = labels?.[0]
    const trackingNumber = primaryLabel?.tracking_number
    const trackingUrl =
      primaryLabel?.tracking_url && primaryLabel.tracking_url !== "#"
        ? primaryLabel.tracking_url
        : trackingNumber
        ? `https://fezdelivery.co/track?order=${trackingNumber}`
        : undefined

    const shipmentData = {
      order_id: order.id,
      display_id: order.display_id ?? undefined,
      customer_name: customerName,
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      items: (fulfillment.items || []).map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: 0,
        total: 0,
      })),
      shipping_address: order.shipping_address
        ? {
            first_name: order.shipping_address.first_name ?? undefined,
            last_name: order.shipping_address.last_name ?? undefined,
            address_1: order.shipping_address.address_1 ?? undefined,
            city: order.shipping_address.city ?? undefined,
            country_code: order.shipping_address.country_code ?? undefined,
            postal_code: order.shipping_address.postal_code ?? undefined,
          }
        : undefined,
    }

    try {
      await notificationService.createNotifications({
        to: order.email,
        channel: "email",
        template: "shipment-created",
        data: shipmentData,
      })

      logger.info(
        `Dispatched shipment notification for order ${order.id} (fulfillment ${fulfillmentId}) to ${order.email}`
      )
    } catch (notifErr) {
      logger.warn(
        `Notification module DB write failed for shipment (${
          notifErr instanceof Error ? notifErr.message : "DB error"
        }). Falling back to direct Resend email dispatch...`
      )

      const apiKey = process.env.RESEND_API_KEY
      if (apiKey) {
        const { Resend } = await import("resend")
        const resend = new Resend(apiKey)
        const fromEmail =
          process.env.RESEND_FROM_EMAIL ||
          "Ayodeji Anifowose Store <onboarding@resend.dev>"

        const { subject, html } = renderShipmentCreatedEmail(shipmentData)

        const res = await resend.emails.send({
          from: fromEmail,
          to: order.email,
          subject,
          html,
        })

        if (res.error) {
          logger.error(
            `Direct Resend shipment notification failed for order ${order.id}: ${res.error.message}`
          )
        } else {
          logger.info(
            `Direct Resend shipment notification sent successfully to ${order.email} (ID: ${res.data?.id})`
          )
        }
      }
    }
  } catch (error) {
    logger.error(
      `Failed to process shipment notification event for fulfillment ${fulfillmentId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
