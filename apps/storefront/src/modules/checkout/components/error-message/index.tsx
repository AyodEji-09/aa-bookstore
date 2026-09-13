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
    if (error) {
      toast.error(error)
    }
  }, [error])

  return null
}

export default ErrorMessage
