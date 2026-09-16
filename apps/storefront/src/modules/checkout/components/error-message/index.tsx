"use client"

import { useEffect } from "react"
import { toast } from "@medusajs/ui"

const ErrorMessage = ({
  error,
}: {
  error?: string | null
  "data-testid"?: string
}) => {
  useEffect(() => {
    if (error && error !== "NEXT_REDIRECT" && !error.includes("NEXT_REDIRECT")) {
      toast.error(error)
    }
  }, [error])

  return null
}

export default ErrorMessage
