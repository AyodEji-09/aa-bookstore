"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function CartQueryCleaner({
  hasDuplicateItems,
}: {
  hasDuplicateItems: boolean
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!hasDuplicateItems && (searchParams?.has("error") || searchParams?.has("item"))) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("error")
      params.delete("item")
      const newQuery = params.toString()
      const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname
      window.history.replaceState(null, "", newUrl)
    }
  }, [hasDuplicateItems, pathname, searchParams])

  return null
}
