import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function seedStripeProvider({
  container,
}: {
  container: MedusaContainer
}) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!process.env.STRIPE_API_KEY) {
    logger.warn(
      "STRIPE_API_KEY is not set. Please set STRIPE_API_KEY in apps/backend/.env before enabling the Stripe provider."
    )
    return
  }

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.*"],
  })

  if (!regions?.length) {
    logger.info("No regions found to update payment providers.")
    return
  }

  for (const region of regions) {
    const existingProviders =
      (region.payment_providers || [])
        .map((p: any) => p?.id)
        .filter((id): id is string => typeof id === "string")

    if (!existingProviders.includes("pp_stripe_stripe")) {
      const updatedProviders = [...existingProviders, "pp_stripe_stripe"]
      await updateRegionsWorkflow(container).run({
        input: {
          selector: { id: region.id },
          update: {
            payment_providers: updatedProviders,
          },
        },
      })
      logger.info(
        `Added Stripe payment provider (pp_stripe_stripe) to region ${region.name} (${region.id})`
      )
    } else {
      logger.info(
        `Stripe payment provider already enabled for region ${region.name} (${region.id})`
      )
    }
  }

  logger.info("Finished seeding Stripe payment provider.")
}
