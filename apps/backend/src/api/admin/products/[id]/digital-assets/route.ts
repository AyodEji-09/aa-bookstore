import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductVariantsWorkflow } from "@medusajs/core-flows"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productId = req.params.id

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "variants.*",
      "variants.metadata",
    ],
    filters: { id: productId },
  })

  const product = products?.[0]
  if (!product) {
    res.status(404).json({ message: "Product not found" })
    return
  }

  res.json({
    variants: product.variants || [],
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const productId = req.params.id
  const { variant_id, format, media_key, file_url } = req.body as {
    variant_id: string
    format?: "ebook" | "audiobook"
    media_key?: string
    file_url?: string
  }

  if (!variant_id) {
    res.status(400).json({ message: "variant_id is required" })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "metadata", "product_id"],
    filters: { id: variant_id },
  })

  const variant = variants?.[0]
  if (!variant) {
    res.status(404).json({ message: "Variant not found" })
    return
  }

  const existingMetadata = (variant.metadata || {}) as Record<string, unknown>
  const isRemove = (req.body as any).action === "remove" || (req.body as any).is_digital === false

  let updatedMetadata: Record<string, unknown> = {}

  if (isRemove) {
    updatedMetadata = {
      ...existingMetadata,
      format: null,
      media_key: null,
      file_url: null,
      is_digital: false,
    }
  } else {
    const effectiveMediaKey = media_key || file_url || (existingMetadata.media_key as string) || null
    const isDigital = Boolean(format || effectiveMediaKey)
    updatedMetadata = {
      ...existingMetadata,
      ...(format ? { format } : {}),
      ...(effectiveMediaKey ? { media_key: effectiveMediaKey } : {}),
      ...(file_url ? { file_url } : {}),
      is_digital: isDigital,
    }
  }

  const { result } = await updateProductVariantsWorkflow(req.scope).run({
    input: {
      product_variants: [
        {
          id: variant_id,
          metadata: updatedMetadata,
        },
      ],
    },
  })

  res.json({
    success: true,
    variant: result?.[0] || null,
  })
}
