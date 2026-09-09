"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion } from "./regions"

export type SearchFormat = "all" | "audiobook" | "ebook" | "hardcover" | "paperback"

export type SearchResultItem = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  author: string
  categories: string[]
  formats: {
    name: string
    format: string
    isDigital: boolean
  }[]
  price: {
    calculatedPrice: string
    originalPrice?: string
    priceNumber: number
  } | null
}

export type SearchBooksParams = {
  query?: string
  format?: SearchFormat
  category?: string
  countryCode: string
  limit?: number
}

export async function searchBooks({
  query = "",
  format = "all",
  category,
  countryCode,
  limit = 20,
}: SearchBooksParams): Promise<SearchResultItem[]> {
  const region = await getRegion(countryCode)
  if (!region) {
    return []
  }

  const headers = await getAuthHeaders()
  const next = await getCacheOptions("products")

  const normalizedQuery = query.trim().toLowerCase()

  // Fetch products with full variants, prices, metadata, categories, and images
  const res = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
    `/store/products`,
    {
      method: "GET",
      query: {
        limit: 50,
        region_id: region.id,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,*variants.options,+metadata,+tags,*images,*categories",
      },
      headers,
      next,
      cache: "force-cache",
    }
  )

  const products = res?.products || []

  // Filter products by matching title, author, format, and category
  const filtered = products.filter((product) => {
    const title = (product.title || "").toLowerCase()
    const subtitle = (product.subtitle || "").toLowerCase()
    const description = (product.description || "").toLowerCase()
    const author = ((product.metadata?.author as string) || "").toLowerCase()
    const publisher = ((product.metadata?.publisher as string) || "").toLowerCase()
    const narrator = ((product.metadata?.narrator as string) || "").toLowerCase()
    const categoryNames = (product.categories || []).map((c) => (c.name || "").toLowerCase())

    const variants = product.variants || []
    const variantFormats = variants.map((v) => {
      const vTitle = (v.title || "").toLowerCase()
      const vFormat = ((v.metadata?.format as string) || "").toLowerCase()
      return `${vTitle} ${vFormat}`
    })

    // 1. Check Format filter if specified
    if (format !== "all") {
      const targetFormat = format.toLowerCase()
      const hasFormat = variants.some((v) => {
        const vTitle = (v.title || "").toLowerCase()
        const vFormat = ((v.metadata?.format as string) || "").toLowerCase()
        if (targetFormat === "audiobook") {
          return vTitle.includes("audio") || vFormat.includes("audio")
        }
        if (targetFormat === "ebook") {
          return vTitle.includes("ebook") || vFormat.includes("ebook") || vTitle.includes("e-book")
        }
        if (targetFormat === "hardcover") {
          return vTitle.includes("hardcover") || vFormat.includes("hardcover")
        }
        if (targetFormat === "paperback") {
          return vTitle.includes("paperback") || vFormat.includes("paperback")
        }
        return vTitle.includes(targetFormat) || vFormat.includes(targetFormat)
      })

      if (!hasFormat) {
        return false
      }
    }

    // 2. Check Category filter if specified
    if (category && category !== "all") {
      const targetCat = category.toLowerCase()
      const matchesCat = product.categories?.some(
        (c) =>
          c.id.toLowerCase() === targetCat ||
          c.handle?.toLowerCase() === targetCat ||
          c.name?.toLowerCase().includes(targetCat)
      )
      if (!matchesCat) {
        return false
      }
    }

    // 3. If query is empty, return all matching the format/category filters
    if (!normalizedQuery) {
      return true
    }

    // 4. Multi-token / multi-field query matching
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean)
    return queryTokens.every((token) => {
      return (
        title.includes(token) ||
        subtitle.includes(token) ||
        author.includes(token) ||
        publisher.includes(token) ||
        narrator.includes(token) ||
        description.includes(token) ||
        categoryNames.some((c) => c.includes(token)) ||
        variantFormats.some((vf) => vf.includes(token))
      )
    })
  })

  // Format into SearchResultItem
  const results: SearchResultItem[] = filtered.slice(0, limit).map((product) => {
    const priceData = getProductPrice({ product })
    const cheapest = priceData?.cheapestPrice

    // Extract available format tags
    const formatSet = new Map<string, { name: string; format: string; isDigital: boolean }>()
    for (const v of product.variants || []) {
      const vTitle = v.title || ""
      const vFormat = ((v.metadata?.format as string) || "").toLowerCase()
      const isDigital = Boolean(v.metadata?.is_digital)

      let standardName = vTitle
      let key = vTitle.toLowerCase()

      if (vTitle.toLowerCase().includes("audio") || vFormat.includes("audio")) {
        standardName = "Audiobook"
        key = "audiobook"
      } else if (vTitle.toLowerCase().includes("ebook") || vFormat.includes("ebook")) {
        standardName = "eBook"
        key = "ebook"
      } else if (vTitle.toLowerCase().includes("hardcover") || vFormat.includes("hardcover")) {
        standardName = "Hardcover"
        key = "hardcover"
      } else if (vTitle.toLowerCase().includes("paperback") || vFormat.includes("paperback")) {
        standardName = "Paperback"
        key = "paperback"
      }

      if (!formatSet.has(key)) {
        formatSet.set(key, {
          name: standardName,
          format: key,
          isDigital,
        })
      }
    }

    return {
      id: product.id,
      title: product.title || "Untitled Book",
      handle: product.handle || product.id,
      thumbnail: product.thumbnail || product.images?.[0]?.url || null,
      author: (product.metadata?.author as string) || "Ayodeji Anifowose",
      categories: (product.categories || []).map((c) => c.name),
      formats: Array.from(formatSet.values()),
      price: cheapest
        ? {
            calculatedPrice: cheapest.calculated_price,
            originalPrice:
              cheapest.original_price_number > cheapest.calculated_price_number
                ? cheapest.original_price
                : undefined,
            priceNumber: cheapest.calculated_price_number,
          }
        : null,
    }
  })

  return results
}
