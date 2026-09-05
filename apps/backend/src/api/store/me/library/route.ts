import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LIBRARY_MODULE } from "../../../../modules/library"
import LibraryModuleService from "../../../../modules/library/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const libraryService: LibraryModuleService = req.scope.resolve(LIBRARY_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const libraryItems = await libraryService.listCustomerLibraryItems({
    customer_id: customerId,
  })

  if (!libraryItems.length) {
    res.json({ items: [] })
    return
  }

  const productIds = Array.from(new Set(libraryItems.map((item) => item.product_id)))

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "description",
      "thumbnail",
      "handle",
      "metadata",
      "categories.name",
    ],
    filters: {
      id: productIds,
    },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  const enrichedItems = libraryItems.map((item) => {
    const product = productMap.get(item.product_id)
    return {
      id: item.id,
      format: item.format,
      progress: item.progress || {
        last_chapter: 1,
        completed: false,
        timestamp_seconds: 0,
      },
      product: product
        ? {
            id: product.id,
            title: product.title,
            description: product.description,
            thumbnail: product.thumbnail,
            handle: product.handle,
            author: (product.metadata?.author as string) || "Eric-Emmanuel Schmitt",
            publisher: (product.metadata?.publisher as string) || "Albin Michel",
            narrator: (product.metadata?.narrator as string) || "Full Cast Audio",
            duration: (product.metadata?.duration as string) || "4h 15m",
            category: product.categories?.[0]?.name || "Literature",
          }
        : null,
      created_at: item.created_at,
    }
  })

  res.json({ items: enrichedItems })
}
