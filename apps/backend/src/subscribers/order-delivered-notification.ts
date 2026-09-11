import dns from "node:dns"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"
import { renderOrderDeliveredEmail } from "../modules/resend/templates"

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first")
}

export default async function orderDeliveredNotificationHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // Respect the admin toggle if send notification was turned off
  if (data.no_notification) {
    logger.info(
      `Delivery notification skipped for fulfillment ${data.id} (no_notification is true)`
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
    const order = (fulfillment as any)?.order
    if (!order || !order.email) {
      logger.warn(
        `Could not find linked order for delivered fulfillment ${fulfillmentId}`
      )
      return
    }

    const customerName =
      `${order.shipping_address?.first_name || ""} ${
        order.shipping_address?.last_name || ""
      }`.trim() || "Reader"

    const deliveryData = {
      order_id: order.id,
      display_id: order.display_id ?? undefined,
      customer_name: customerName,
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
        template: "order-delivered",
        data: deliveryData,
      })

      logger.info(
        `Dispatched delivery confirmation notification for order ${order.id} (fulfillment ${fulfillmentId}) to ${order.email}`
      )
    } catch (notifErr) {
      logger.warn(
        `Notification module DB write failed for delivery (${
          notifErr instanceof Error ? notifErr.message : "DB error"
        }). Falling back to direct Resend email dispatch...`
      )

      const apiKey = process.env.RESEND_API_KEY
      if (apiKey) {
        const { Resend } = await import("resend")
        const resend = new Resend(apiKey)
        const fromEmail =
          process.env.RESEND_FROM_EMAIL ||
          "Ayodeji Anifowose Bookstore <onboarding@resend.dev>"

        const { subject, html } = renderOrderDeliveredEmail(deliveryData)

        const res = await resend.emails.send({
          from: fromEmail,
          to: order.email,
          subject,
          html,
        })

        if (res.error) {
          logger.error(
            `Direct Resend delivery notification failed for order ${order.id}: ${res.error.message}`
          )
        } else {
          logger.info(
            `Direct Resend delivery notification sent successfully to ${order.email} (ID: ${res.data?.id})`
          )
        }
      }
    }
  } catch (error) {
    logger.error(
      `Failed to process delivery notification event for fulfillment ${fulfillmentId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "delivery.created",
}
