import dns from "node:dns"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"
import {
  renderOrderPlacedEmail,
  renderAdminOrderPlacedEmail,
} from "../modules/resend/templates"

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first")
}

export default async function orderPlacedNotificationHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const orderId = data.id

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "total",
        "subtotal",
        "shipping_total",
        "tax_total",
        "shipping_address.*",
        "items.*",
        "items.variant.*",
        "items.variant.product.*",
      ],
      filters: {
        id: orderId,
      },
    })

    const order = orders?.[0]
    if (!order || !order.email) {
      return
    }

    const storefrontUrl =
      process.env.STOREFRONT_URL ||
      process.env.STORE_CORS?.split(",")[0] ||
      "http://localhost:8000"

    let hasDigitalItems = false
    const items = (order.items || []).map((item: any) => {
      const variantTitle = (item.variant_title || item.title || "").toLowerCase()
      const metadata = {
        ...(item.variant?.product?.metadata || {}),
        ...(item.variant?.metadata || {}),
        ...(item.metadata || {}),
      }

      let format: string | null = null
      if (
        metadata.format === "ebook" ||
        metadata.is_ebook ||
        variantTitle.includes("ebook") ||
        variantTitle.includes("e-book")
      ) {
        format = "Ebook"
        hasDigitalItems = true
      } else if (
        metadata.format === "audiobook" ||
        metadata.is_audiobook ||
        variantTitle.includes("audiobook") ||
        variantTitle.includes("audio")
      ) {
        format = "Audiobook"
        hasDigitalItems = true
      } else if (variantTitle.includes("hardcover")) {
        format = "Hardcover"
      } else if (variantTitle.includes("paperback")) {
        format = "Paperback"
      }

      return {
        title: item.title,
        thumbnail: item.thumbnail,
        format,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total || item.unit_price * item.quantity,
      }
    })

    const customerName =
      `${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || ""}`.trim() ||
      "Reader"

    const notificationData = {
      order_id: order.id,
      display_id: order.display_id ?? undefined,
      customer_name: customerName,
      items,
      subtotal: order.subtotal ?? order.total,
      shipping_total: order.shipping_total ?? 0,
      tax_total: order.tax_total ?? 0,
      total: order.total,
      currency_code: order.currency_code,
      has_digital_items: hasDigitalItems,
      library_url: `${storefrontUrl}/account/library`,
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

    const adminNotificationEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL

    const adminNotificationData = {
      ...notificationData,
      customer_email: order.email,
      admin_order_url: `${
        process.env.ADMIN_CORS?.split(",")[0] || "http://localhost:9000/app"
      }/orders/${order.id}`,
    }

    try {
      await notificationService.createNotifications({
        to: order.email,
        channel: "email",
        template: "order-placed",
        data: notificationData,
      })

      logger.info(
        `Dispatched order confirmation notification for order ${order.id} to ${order.email}`
      )
    } catch (notifErr) {
      logger.warn(
        `Notification module database write failed (${
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

        const { subject, html } = renderOrderPlacedEmail(notificationData)

        const res = await resend.emails.send({
          from: fromEmail,
          to: order.email,
          subject,
          html,
        })

        if (res.error) {
          logger.error(
            `Direct Resend fallback failed for order ${order.id}: ${res.error.message}`
          )
        } else {
          logger.info(
            `Direct Resend fallback order confirmation sent successfully to ${order.email} (ID: ${res.data?.id})`
          )
        }
      } else {
        logger.error(
          `Cannot fallback to direct Resend: RESEND_API_KEY is not configured.`
        )
      }
    }

    // Dispatch Admin Notification if admin email is configured
    if (adminNotificationEmail) {
      try {
        await notificationService.createNotifications({
          to: adminNotificationEmail,
          channel: "email",
          template: "order-placed-admin",
          data: adminNotificationData,
        })

        logger.info(
          `Dispatched admin order notification for order ${order.id} to ${adminNotificationEmail}`
        )
      } catch (adminErr) {
        const apiKey = process.env.RESEND_API_KEY
        if (apiKey) {
          const { Resend } = await import("resend")
          const resend = new Resend(apiKey)
          const fromEmail =
            process.env.RESEND_FROM_EMAIL ||
            "Ayodeji Anifowose Bookstore <onboarding@resend.dev>"

          const { subject, html } = renderAdminOrderPlacedEmail(adminNotificationData)

          await resend.emails.send({
            from: fromEmail,
            to: adminNotificationEmail,
            subject,
            html,
          })
          logger.info(
            `Direct Resend admin order notification sent successfully to ${adminNotificationEmail}`
          )
        }
      }
    }

    // Dispatch In-App Admin Notification Feed (populates the admin notification bell drawer)
    try {
      const orderRef = order.display_id ? `#${order.display_id}` : order.id
      const formattedTotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: (order.currency_code || "usd").toUpperCase(),
      }).format(Number(order.total) / 100)

      await notificationService.createNotifications({
        to: "", // Medusa Admin queries to: [admin_user_id, admin_user_email, ""]
        channel: "feed",
        template: "order-placed-feed",
        data: {
          title: `New Order ${orderRef}`,
          description: `Received ${formattedTotal} from ${customerName} (${order.email}).`,
        },
      })

      logger.info(
        `Created in-app admin feed notification for order ${order.id}`
      )
    } catch (feedErr) {
      logger.warn(
        `Failed to create admin feed notification: ${
          feedErr instanceof Error ? feedErr.message : "Unknown error"
        }`
      )
    }
  } catch (error) {
    logger.error(
      `Failed to process order confirmation event for order ${orderId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
