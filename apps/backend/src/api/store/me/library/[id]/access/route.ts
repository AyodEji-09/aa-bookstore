import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LIBRARY_MODULE } from "../../../../../../modules/library"
import LibraryModuleService from "../../../../../../modules/library/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const itemId = req.params.id
  const libraryService: LibraryModuleService = req.scope.resolve(LIBRARY_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const items = await libraryService.listCustomerLibraryItems({
    id: itemId,
    customer_id: customerId,
  })

  const item = items?.[0]
  if (!item) {
    res.status(404).json({ message: "Digital book not found in your library" })
    return
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "description", "thumbnail", "metadata"],
    filters: { id: item.product_id },
  })

  const product = products?.[0]

  let fileUrl = item.media_key

  // 1. If not stored on the library item, check the specific variant
  if (!fileUrl && item.variant_id) {
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "metadata"],
      filters: { id: item.variant_id },
    })
    const vMeta = (variants?.[0]?.metadata || {}) as Record<string, unknown>
    fileUrl = (vMeta?.file_url as string) || (vMeta?.media_key as string) || null
  }

  // 2. Fallback: check all variants of the product matching the format
  if (!fileUrl && item.product_id) {
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "metadata", "title"],
      filters: { product_id: item.product_id },
    })
    for (const v of variants || []) {
      const vMeta = (v.metadata || {}) as Record<string, unknown>
      const vFormat =
        vMeta?.format ||
        (v.title?.toLowerCase().includes("ebook")
          ? "ebook"
          : v.title?.toLowerCase().includes("audio")
          ? "audiobook"
          : null)
      if (vFormat === item.format && (vMeta?.file_url || vMeta?.media_key)) {
        fileUrl = (vMeta.file_url as string) || (vMeta.media_key as string)
        break
      }
    }
  }

  // Audio track configuration
  const audioTracks =
    fileUrl && (fileUrl.includes(".mp3") || fileUrl.includes(".m4b") || fileUrl.includes(".m4a") || item.format === "audiobook")
      ? [
          {
            id: 1,
            title: product?.title || "Audiobook",
            duration: 3600,
            streamUrl: fileUrl,
          },
        ]
      : [
          {
            id: 1,
            title: "Prologue - The Letter",
            duration: 312,
            streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          },
        ]

  const sampleEbookChapters = [
    {
      id: 1,
      title: "Prologue",
      content: [
        "Sample Preview: No digital file was attached to this book yet in the admin dashboard.",
        "To read the complete book, please upload the EPUB or PDF file in the Medusa Admin under Digital Products & Formats.",
      ],
    },
  ]

  res.json({
    item: {
      id: item.id,
      format: item.format,
      file_url: fileUrl || null,
      media_key: fileUrl || null,
      progress: item.progress || {
        last_chapter: 1,
        completed: false,
        timestamp_seconds: 0,
      },
      product: {
        id: product?.id,
        title: product?.title || "Digital Book",
        author: (product?.metadata?.author as string) || "Eric-Emmanuel Schmitt",
        thumbnail: product?.thumbnail,
      },
      tracks: item.format === "audiobook" ? audioTracks : undefined,
      chapters: item.format === "ebook" ? sampleEbookChapters : undefined,
    },
  })
}
