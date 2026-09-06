import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function seedDigitalShipping({
  container,
}: {
  container: MedusaContainer
}) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const { data: zones } = await query.graph({
    entity: "service_zone",
    fields: ["id"],
  })
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })

  if (!profiles?.length || !zones?.length) {
    console.log("No profiles or service zones found")
    return
  }

  const { data: existingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
    filters: { name: "Digital Delivery" },
  })

  if (existingOptions?.length) {
    console.log("Digital Delivery shipping option already exists")
    return
  }

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Digital Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: zones[0].id,
        shipping_profile_id: profiles[0].id,
        type: {
          label: "Digital Delivery",
          description: "Instant access to digital items in your library.",
          code: "digital",
        },
        prices: [
          { currency_code: "usd", amount: 0 },
          { currency_code: "eur", amount: 0 },
          ...(regions[0] ? [{ region_id: regions[0].id, amount: 0 }] : []),
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })

  console.log("Successfully created Digital Delivery shipping option!")
}
