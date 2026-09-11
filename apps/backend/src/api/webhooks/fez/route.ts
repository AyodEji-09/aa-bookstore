import crypto from "node:crypto"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { FezWebhookPayload } from "../../../modules/fez/types"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const secretKey = process.env.FEZ_SECRET_KEY
  const signature = (req.headers["x-signature"] || req.headers["X-Signature"]) as string | undefined
  const timestamp = (req.headers["x-timestamp"] || req.headers["X-Timestamp"]) as string | undefined
  const body = req.body as FezWebhookPayload

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  // Verify HMAC-SHA256 signature if secretKey is configured
  if (secretKey && signature && timestamp && body?.orderNumber && body?.status) {
    const rawData = `${body.orderNumber}${body.status}${timestamp}`
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawData)
      .digest("hex")

    if (signature !== expectedSignature) {
      logger.warn(`Fez webhook signature mismatch for order ${body.orderNumber}`)
      res.status(401).json({ status: "Error", message: "Invalid signature" })
      return
    }
  }

  logger.info(
    `Fez webhook received: Order ${body?.orderNumber} status changed to ${body?.status}`
  )

  const fulfillmentService = req.scope.resolve(Modules.FULFILLMENT)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    // If the status is "Delivered", check for active fulfillments matching this Fez order number
    if (body?.status?.toLowerCase() === "delivered" && body?.orderNumber) {
      const [fulfillments] = await fulfillmentService.listAndCountFulfillments({
        provider_id: "fez",
      })

      const targetFulfillment = fulfillments?.find((f: any) => {
        return (
          f.data?.fez_order_number === body.orderNumber ||
          f.data?.unique_id === body.orderNumber ||
          f.labels?.some((l: any) => l.tracking_number === body.orderNumber)
        )
      })

      if (targetFulfillment && !targetFulfillment.delivered_at) {
        logger.info(
          `Marking fulfillment ${targetFulfillment.id} as delivered via Fez webhook`
        )

        const { data: fullFulfillments } = await query.graph({
          entity: "fulfillment",
          fields: ["id", "order.id"],
          filters: { id: targetFulfillment.id },
        })

        const orderId = (fullFulfillments?.[0] as any)?.order?.id
        if (orderId) {
          const { markOrderFulfillmentAsDeliveredWorkflow } = await import(
            "@medusajs/core-flows"
          )
          await markOrderFulfillmentAsDeliveredWorkflow(req.scope).run({
            input: {
              orderId,
              fulfillmentId: targetFulfillment.id,
              no_notification: false,
            },
          })
          logger.info(
            `Successfully marked fulfillment ${targetFulfillment.id} delivered for order ${orderId}`
          )
        }
      }
    }

    res.status(200).json({ status: "Success", message: "Webhook processed" })
  } catch (error) {
    logger.error(`Error processing Fez webhook: ${error}`)
    res.status(200).json({ status: "Received", message: "Error logged" })
  }
}
