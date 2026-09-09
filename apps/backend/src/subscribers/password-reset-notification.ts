import dns from "node:dns"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first")
}

interface PasswordResetEventData {
  entity_id: string
  actor_type: string
  token: string
}

export default async function passwordResetNotificationHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetEventData>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notificationService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const { entity_id: email, actor_type, token } = data

  if (!email || !token) {
    return
  }

  try {
    let resetUrl: string

    if (actor_type === "user") {
      const baseAdmin = (
        process.env.MEDUSA_ADMIN_URL || "http://localhost:9000"
      ).replace(/\/$/, "")
      const adminUrl = baseAdmin.endsWith("/app")
        ? baseAdmin
        : `${baseAdmin}/app`
      resetUrl = `${adminUrl}/reset-password?token=${encodeURIComponent(token)}`
    } else if (actor_type === "customer") {
      const storefrontUrl =
        process.env.STOREFRONT_URL ||
        process.env.STORE_CORS?.split(",")[0] ||
        "http://localhost:8000"

      resetUrl = `${storefrontUrl}/reset-password?token=${encodeURIComponent(
        token
      )}&email=${encodeURIComponent(email)}`
    } else {
      return
    }

    try {
      await notificationService.createNotifications({
        to: email,
        channel: "email",
        template: "password-reset",
        data: {
          email,
          reset_url: resetUrl,
          actor_type,
        },
      })

      logger.info(
        `Dispatched password reset email notification to ${email} (${actor_type})`
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
        const { renderPasswordResetEmail } = await import(
          "../modules/resend/templates"
        )
        const resend = new Resend(apiKey)
        const fromEmail =
          process.env.RESEND_FROM_EMAIL ||
          "Ayodeji Anifowose Bookstore <onboarding@resend.dev>"

        const { subject, html } = renderPasswordResetEmail({
          email,
          reset_url: resetUrl,
          actor_type,
        })

        const res = await resend.emails.send({
          from: fromEmail,
          to: email,
          subject,
          html,
        })

        if (res.error) {
          logger.error(
            `Direct Resend fallback failed for ${email}: ${res.error.message}`
          )
        } else {
          logger.info(
            `Direct Resend fallback email sent successfully to ${email} (ID: ${res.data?.id})`
          )
        }
      } else {
        logger.error(
          `Cannot fallback to direct Resend: RESEND_API_KEY is not configured.`
        )
      }
    }
  } catch (error) {
    logger.error(
      `Failed to process password reset event for ${email}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
