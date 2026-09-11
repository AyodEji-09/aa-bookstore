import dns from "node:dns"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"
import { renderOrderFulfillmentCreatedEmail } from "../modules/resend/templates"

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first")
}

export default async function orderFulfillmentCreatedNotificationHandler({
  event: { data },
  container,
}: SubscriberArgs<{ order_id: string; fulfillment_id: string; no_notification?: boolean }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // Respect the admin toggle if send notification was turned off
  if (data.no_notification) {
    logger.info(
      `Fulfillment notification skipped for order ${data.order_id} (no_notification is true)`
    )
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const { order_id: orderId, fulfillment_id: fulfillmentId } = data

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "shipping_address.*",
        "fulfillments.*",
        "fulfillments.items.*",
        "items.*",
      ],
      filters: {
        id: orderId,
      },
    })

    const order = orders?.[0]
    if (!order || !order.email) {
      logger.warn(
        `Could not find order ${orderId} for fulfillment notification`
      )
      return
    }

    const customerName =
      `${order.shipping_address?.first_name || ""} ${
        order.shipping_address?.last_name || ""
      }`.trim() || "Reader"

    const targetFulfillment = (order.fulfillments || []).find(
      (f: any) => f.id === fulfillmentId
    )

    const fulfillmentItems =
      targetFulfillment?.items?.length
        ? targetFulfillment.items.map((item: any) => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: 0,
            total: 0,
          }))
        : (order.items || []).map((item: any) => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: Number(item.unit_price) || 0,
            total: Number(item.total) || 0,
          }))

    const fulfillmentData = {
      order_id: order.id,
      display_id: order.display_id ?? undefined,
      customer_name: customerName,
      items: fulfillmentItems,
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
        template: "order-fulfillment-created",
        data: fulfillmentData,
      })

      logger.info(
        `Dispatched fulfillment created notification for order ${order.id} to ${order.email}`
      )
    } catch (notifErr) {
      logger.warn(
        `Notification module DB write failed for fulfillment created (${
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

        const { subject, html } = renderOrderFulfillmentCreatedEmail(fulfillmentData)

        const res = await resend.emails.send({
          from: fromEmail,
          to: order.email,
          subject,
          html,
        })

        if (res.error) {
          logger.error(
            `Direct Resend fulfillment created notification failed for order ${order.id}: ${res.error.message}`
          )
        } else {
          logger.info(
            `Direct Resend fulfillment created notification sent successfully to ${order.email} (ID: ${res.data?.id})`
          )
        }
      }
    }
  } catch (error) {
    logger.error(
      `Failed to process fulfillment created notification event for order ${orderId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
}
