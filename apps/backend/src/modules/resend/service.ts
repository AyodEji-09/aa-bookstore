import dns from "node:dns"
import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { Resend } from "resend"
import {
  renderOrderPlacedEmail,
  renderAdminOrderPlacedEmail,
  renderOrderFulfillmentCreatedEmail,
  renderShipmentCreatedEmail,
  renderOrderDeliveredEmail,
  renderPasswordResetEmail,
} from "./templates"

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first")
}

interface ResendServiceOptions {
  api_key?: string
  from?: string
}

interface InjectedDependencies {
  logger: Logger
}

export class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "resend"
  protected config_: ResendServiceOptions
  protected logger_: Logger
  protected resend_: Resend | null = null

  constructor({ logger }: InjectedDependencies, options: ResendServiceOptions) {
    super()
    this.config_ = {
      api_key: options?.api_key || process.env.RESEND_API_KEY,
      from:
        options?.from ||
        process.env.RESEND_FROM_EMAIL ||
        "Ayodeji Anifowose Bookstore <onboarding@resend.dev>",
    }
    this.logger_ = logger

    if (this.config_.api_key) {
      this.resend_ = new Resend(this.config_.api_key)
    } else {
      this.logger_.info(
        "Resend API key not found. Emails will be logged to console in development mode."
      )
    }
  }

  async send(notification: any): Promise<Record<string, unknown>> {
    if (!notification) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No notification information provided"
      )
    }

    const data = notification.data || {}

    // In-app feed notifications are persisted directly to the database and do not send external emails
    if (notification.channel === "feed") {
      this.logger_.info(
        `[Feed Notification] ${data.title || "New notification"}: ${
          data.description || ""
        }`
      )
      return {}
    }

    const to = notification.to
    const from = notification.from?.trim() || this.config_.from!
    const template = notification.template

    let subject = notification.content?.subject || "Notification from Bookstore"
    let html = notification.content?.html || ""

    if (template === "order-placed") {
      const rendered = renderOrderPlacedEmail(data)
      subject = rendered.subject
      html = rendered.html
    } else if (template === "order-placed-admin") {
      const rendered = renderAdminOrderPlacedEmail(data)
      subject = rendered.subject
      html = rendered.html
    } else if (template === "order-fulfillment-created") {
      const rendered = renderOrderFulfillmentCreatedEmail(data)
      subject = rendered.subject
      html = rendered.html
    } else if (template === "shipment-created") {
      const rendered = renderShipmentCreatedEmail(data)
      subject = rendered.subject
      html = rendered.html
    } else if (template === "order-delivered") {
      const rendered = renderOrderDeliveredEmail(data)
      subject = rendered.subject
      html = rendered.html
    } else if (template === "password-reset") {
      const rendered = renderPasswordResetEmail(data)
      subject = rendered.subject
      html = rendered.html
    }

    if (!html) {
      html = `<p>${JSON.stringify(data)}</p>`
    }

    if (this.resend_) {
      try {
        const response = await this.resend_.emails.send({
          from,
          to,
          subject,
          html,
        })

        if (response.error) {
          this.logger_.error(
            `Resend API returned error for ${to}: ${response.error.message}`
          )
          throw new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            `Resend API error: ${response.error.message}`
          )
        }

        this.logger_.info(
          `Resend email sent successfully to ${to} (ID: ${response.data?.id})`
        )
        return { id: response.data?.id }
      } catch (err: any) {
        this.logger_.error(
          `Failed to send email via Resend to ${to}: ${err.message}`
        )
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Failed to send email via Resend: ${err.message}`
        )
      }
    } else {
      this.logger_.info(
        `[Resend Dev Mode] Simulated email to: ${to} | Subject: "${subject}"`
      )
      return {}
    }
  }
}

export default ResendNotificationService
