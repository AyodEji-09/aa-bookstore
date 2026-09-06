import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { WISHLIST_MODULE } from "../../../../modules/wishlist"
import WishlistModuleService from "../../../../modules/wishlist/service"
import { addToWishlistWorkflow } from "../../../../workflows/add-to-wishlist"
import { removeFromWishlistWorkflow } from "../../../../workflows/remove-from-wishlist"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const wishlistService: WishlistModuleService = req.scope.resolve(WISHLIST_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const wishlistItems = await wishlistService.listCustomerWishlistItems({
    customer_id: customerId,
  })

  if (!wishlistItems.length) {
    res.json({ items: [] })
    return
  }

  const productIds = Array.from(new Set(wishlistItems.map((item) => item.product_id)))

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "subtitle",
      "description",
      "thumbnail",
      "handle",
      "metadata",
      "categories.name",
      "variants.id",
      "variants.title",
      "variants.metadata",
    ],
    filters: {
      id: productIds,
    },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  const enrichedItems = wishlistItems.map((item) => {
    const product = productMap.get(item.product_id)
    return {
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product: product
        ? {
            id: product.id,
            title: product.title,
            subtitle: product.subtitle,
            description: product.description,
            thumbnail: product.thumbnail,
            handle: product.handle,
            author: (product.metadata?.author as string) || "Eric-Emmanuel Schmitt",
            category: product.categories?.[0]?.name || "Literature",
            variants: product.variants,
          }
        : null,
      created_at: item.created_at,
    }
  })

  res.json({ items: enrichedItems })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const body = req.body as { product_id?: string; variant_id?: string }
  const productId = body?.product_id

  if (!productId) {
    res.status(400).json({ message: "product_id is required" })
    return
  }

  const { result } = await addToWishlistWorkflow(req.scope).run({
    input: {
      customer_id: customerId,
      product_id: productId,
      variant_id: body.variant_id || null,
    },
  })

  res.status(201).json({ item: result })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const productId =
    (req.query?.product_id as string) ||
    (req.body as { product_id?: string })?.product_id
  const itemId =
    (req.query?.id as string) ||
    (req.body as { id?: string })?.id

  if (!productId && !itemId) {
    res.status(400).json({ message: "product_id or id is required" })
    return
  }

  await removeFromWishlistWorkflow(req.scope).run({
    input: {
      customer_id: customerId,
      product_id: productId,
      id: itemId,
    },
  })

  res.json({ success: true })
}
