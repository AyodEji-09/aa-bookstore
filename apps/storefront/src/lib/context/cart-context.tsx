"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

type CartContextType = {
  optimisticCountDelta: number
  triggerCartDropdown: boolean
  notifyItemAdded: (quantity?: number) => void
  notifyItemRemoved: (quantity?: number) => void
  resetCartNotification: () => void
  openCartDropdown: () => void
  closeCartDropdown: () => void
  clearOptimisticDelta: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [optimisticCountDelta, setOptimisticCountDelta] = useState(0)
  const [triggerCartDropdown, setTriggerCartDropdown] = useState(false)

  const notifyItemAdded = useCallback((quantity = 1) => {
    setOptimisticCountDelta((prev) => prev + quantity)
    setTriggerCartDropdown(true)
  }, [])

  const notifyItemRemoved = useCallback((quantity = 1) => {
    setOptimisticCountDelta((prev) => Math.max(0, prev - quantity))
  }, [])

  const resetCartNotification = useCallback(() => {
    setTriggerCartDropdown(false)
  }, [])

  const clearOptimisticDelta = useCallback(() => {
    setOptimisticCountDelta(0)
  }, [])

  const openCartDropdown = useCallback(() => {
    setTriggerCartDropdown(true)
  }, [])

  const closeCartDropdown = useCallback(() => {
    setTriggerCartDropdown(false)
  }, [])

  return (
    <CartContext.Provider
      value={{
        optimisticCountDelta,
        triggerCartDropdown,
        notifyItemAdded,
        notifyItemRemoved,
        resetCartNotification,
        openCartDropdown,
        closeCartDropdown,
        clearOptimisticDelta,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
