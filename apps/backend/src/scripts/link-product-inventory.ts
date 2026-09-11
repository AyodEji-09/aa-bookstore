import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createInventoryItemsWorkflow } from "@medusajs/core-flows"

export default async function linkProductInventory({
  container,
}: {
  container: MedusaContainer
}) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const remoteLink = container.resolve(ContainerRegistrationKeys.LINK)

  logger.info("Checking products and physical variants for inventory setup...")

  // Fetch all active products with variants
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.manage_inventory",
    ],
  })

  // Fetch stock locations
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })

  logger.info(`Found ${stockLocations.length} stock location(s): ${stockLocations.map(l => l.name).join(", ")}`)

  const lagosLoc = stockLocations.find(l => l.name.toLowerCase().includes("lagos")) || stockLocations[0]

  for (const product of products) {
    logger.info(`Checking product: "${product.title}" (${product.id})`)

    for (const variant of product.variants || []) {
      const isDigital =
        variant.title?.toLowerCase().includes("ebook") ||
        variant.title?.toLowerCase().includes("audiobook")

      if (isDigital) {
        logger.info(`  Skipping digital variant: ${variant.title}`)
        continue
      }

      logger.info(`  Processing physical variant: "${variant.title}" (${variant.id})`)

      // Check if variant is already linked to an inventory item
      const { data: existingLinks } = await query.graph({
        entity: "product_variant",
        fields: ["id", "inventory_items.*"],
        filters: { id: variant.id },
      })

      const linkedItems = existingLinks?.[0]?.inventory_items || []
      if (linkedItems.length > 0) {
        logger.info(`    Variant "${variant.title}" already has ${linkedItems.length} inventory item(s) linked.`)
        continue
      }

      // Generate SKU if missing
      const baseSku = product.handle.toUpperCase().replace(/[^A-Z0-9]/g, "-").slice(0, 10)
      const variantSku = variant.sku || `${baseSku}-${variant.title.toUpperCase().slice(0, 3)}`

      logger.info(`    Creating inventory item with SKU "${variantSku}" for variant "${variant.title}"...`)

      const { result: createdItems } = await createInventoryItemsWorkflow(container).run({
        input: {
          items: [
            {
              sku: variantSku,
              title: `${product.title} - ${variant.title}`,
              requires_shipping: true,
              location_levels: stockLocations.map(loc => ({
                location_id: loc.id,
                stocked_quantity: 50,
              })),
            },
          ],
        },
      })

      const inventoryItem = createdItems[0]
      logger.info(`    Created inventory item: ${inventoryItem.id} (${inventoryItem.sku})`)

      // Link variant to inventory item
      logger.info(`    Linking variant ${variant.id} to inventory item ${inventoryItem.id}...`)
      await remoteLink.create([
        {
          [Modules.PRODUCT]: {
            variant_id: variant.id,
          },
          [Modules.INVENTORY]: {
            inventory_item_id: inventoryItem.id,
          },
        },
      ])

      logger.info(`    Successfully linked variant "${variant.title}" to inventory item ${inventoryItem.id} with 50 units in stock!`)
    }
  }

  logger.info("Inventory check and linking completed successfully!")
}
