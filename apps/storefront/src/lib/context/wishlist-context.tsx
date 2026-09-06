"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import {
  WishlistItem,
  listWishlistItems,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from "@lib/data/wishlist"

const GUEST_STORAGE_KEY = "ayollc_guest_wishlist"

type WishlistContextType = {
  wishlistProductIds: Set<string>
  wishlistItems: WishlistItem[]
  wishlistCount: number
  isWishlisted: (productId: string) => boolean
  toggleWishlist: (productId: string, variantId?: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  refreshWishlist: () => Promise<void>
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<string>>(
    new Set()
  )
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadWishlist = useCallback(async () => {
    try {
      // 1. Check local guest storage
      let guestIds: string[] = []
      try {
        const stored = localStorage.getItem(GUEST_STORAGE_KEY)
        if (stored) {
          guestIds = JSON.parse(stored)
        }
      } catch {}

      // 2. Fetch from backend
      const backendItems = await listWishlistItems()

      if (backendItems.length > 0) {
        // Authenticated customer with items
        const backendIds = new Set(backendItems.map((item) => item.product_id))

        // Sync any guest items to backend
        if (guestIds.length > 0) {
          for (const gId of guestIds) {
            if (!backendIds.has(gId)) {
              await apiAddToWishlist(gId).catch(() => {})
              backendIds.add(gId)
            }
          }
          localStorage.removeItem(GUEST_STORAGE_KEY)
          const updated = await listWishlistItems()
          setWishlistItems(updated)
          setWishlistProductIds(new Set(updated.map((i) => i.product_id)))
        } else {
          setWishlistItems(backendItems)
          setWishlistProductIds(backendIds)
        }
      } else if (guestIds.length > 0) {
        // Check if user is authenticated without items; if so, sync guest items
        const res = await apiAddToWishlist(guestIds[0]).catch(() => ({ success: false }))
        if (res.success) {
          for (let i = 1; i < guestIds.length; i++) {
            await apiAddToWishlist(guestIds[i]).catch(() => {})
          }
          localStorage.removeItem(GUEST_STORAGE_KEY)
          const synced = await listWishlistItems()
          setWishlistItems(synced)
          setWishlistProductIds(new Set(synced.map((i) => i.product_id)))
        } else {
          // Unauthenticated guest: use local storage
          setWishlistProductIds(new Set(guestIds))
          setWishlistItems([])
        }
      } else {
        setWishlistProductIds(new Set())
        setWishlistItems([])
      }
    } catch (err) {
      console.error("Failed to load wishlist", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  const isWishlisted = useCallback(
    (productId: string) => wishlistProductIds.has(productId),
    [wishlistProductIds]
  )

  const toggleWishlist = useCallback(
    async (productId: string, variantId?: string) => {
      const currentlyWishlisted = wishlistProductIds.has(productId)

      // Optimistic update
      setWishlistProductIds((prev) => {
        const next = new Set(prev)
        if (currentlyWishlisted) {
          next.delete(productId)
        } else {
          next.add(productId)
        }
        return next
      })

      if (currentlyWishlisted) {
        setWishlistItems((prev) => prev.filter((i) => i.product_id !== productId))
        const res = await apiRemoveFromWishlist(productId).catch(() => ({ success: false }))
        if (!res.success) {
          // Update guest storage
          try {
            const stored = localStorage.getItem(GUEST_STORAGE_KEY)
            const current = stored ? JSON.parse(stored) : []
            const updated = current.filter((id: string) => id !== productId)
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated))
          } catch {}
        }
      } else {
        const res = await apiAddToWishlist(productId, variantId).catch(() => ({ success: false }))
        if (res.success && res.item) {
          setWishlistItems((prev) => [...prev, res.item!])
        } else {
          // Update guest storage
          try {
            const stored = localStorage.getItem(GUEST_STORAGE_KEY)
            const current = stored ? JSON.parse(stored) : []
            if (!current.includes(productId)) {
              current.push(productId)
              localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(current))
            }
          } catch {}
        }
      }
    },
    [wishlistProductIds]
  )

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      setWishlistProductIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
      setWishlistItems((prev) => prev.filter((i) => i.product_id !== productId))

      const res = await apiRemoveFromWishlist(productId).catch(() => ({ success: false }))
      if (!res.success) {
        try {
          const stored = localStorage.getItem(GUEST_STORAGE_KEY)
          const current = stored ? JSON.parse(stored) : []
          const updated = current.filter((id: string) => id !== productId)
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated))
        } catch {}
      }
    },
    []
  )

  return (
    <WishlistContext.Provider
      value={{
        wishlistProductIds,
        wishlistItems,
        wishlistCount: wishlistProductIds.size,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist: loadWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
