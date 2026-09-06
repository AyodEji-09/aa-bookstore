"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type WishlistItem = {
  id: string
  product_id: string
  variant_id?: string | null
  product: {
    id: string
    title: string
    subtitle?: string
    description?: string
    thumbnail?: string
    handle?: string
    author?: string
    category?: string
    variants?: {
      id: string
      title: string
      metadata?: Record<string, unknown>
    }[]
  } | null
  created_at: string
}

export async function listWishlistItems(): Promise<WishlistItem[]> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    return []
  }

  try {
    const res = await sdk.client.fetch<{ items: WishlistItem[] }>(
      "/store/me/wishlist",
      {
        method: "GET",
        headers: {
          ...authHeaders,
        },
        cache: "no-store",
      }
    )

    return res?.items || []
  } catch (error) {
    console.error("Failed to fetch customer wishlist items", error)
    return []
  }
}

export async function addToWishlist(
  productId: string,
  variantId?: string
): Promise<{ success: boolean; item?: WishlistItem }> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    return { success: false }
  }

  try {
    const res = await sdk.client.fetch<{ item: WishlistItem }>(
      "/store/me/wishlist",
      {
        method: "POST",
        body: {
          product_id: productId,
          variant_id: variantId || null,
        },
        headers: {
          ...authHeaders,
        },
      }
    )

    return { success: true, item: res.item }
  } catch (error) {
    console.error("Failed to add item to wishlist", error)
    return { success: false }
  }
}

export async function removeFromWishlist(
  productId: string,
  id?: string
): Promise<{ success: boolean }> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    return { success: false }
  }

  try {
    const query = id ? `id=${id}` : `product_id=${productId}`
    await sdk.client.fetch(`/store/me/wishlist?${query}`, {
      method: "DELETE",
      headers: {
        ...authHeaders,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to remove item from wishlist", error)
    return { success: false }
  }
}
