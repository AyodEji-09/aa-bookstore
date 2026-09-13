"use client"

import { acceptTransferRequest, declineTransferRequest } from "@lib/data/orders"
import { toast } from "@medusajs/ui"
import { Button, Text } from "@modules/common/components/ui"
import { useState } from "react"

type TransferStatus = "pending" | "success" | "error"

const TransferActions = ({ id, token }: { id: string; token: string }) => {
  const [status, setStatus] = useState<{
    accept: TransferStatus | null
    decline: TransferStatus | null
  } | null>({
    accept: null,
    decline: null,
  })

  const acceptTransfer = async () => {
    setStatus({ accept: "pending", decline: null })

    const { success, error } = await acceptTransferRequest(id, token)

    if (error) {
      toast.error(error)
    } else if (success) {
      toast.success("Order transferred successfully!")
    }
    setStatus({ accept: success ? "success" : "error", decline: null })
  }

  const declineTransfer = async () => {
    setStatus({ accept: null, decline: "pending" })

    const { success, error } = await declineTransferRequest(id, token)

    if (error) {
      toast.error(error)
    } else if (success) {
      toast.success("Order transfer declined successfully!")
    }
    setStatus({ accept: null, decline: success ? "success" : "error" })
  }

  return (
    <div className="flex flex-col gap-y-4">
      {status?.accept === "success" && (
        <Text className="text-emerald-500">
          Order transferred successfully!
        </Text>
      )}
      {status?.decline === "success" && (
        <Text className="text-emerald-500">
          Order transfer declined successfully!
        </Text>
      )}
      {status?.accept !== "success" && status?.decline !== "success" && (
        <div className="flex gap-x-4">
          <Button
            size="large"
            onClick={acceptTransfer}
            isLoading={status?.accept === "pending"}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            Accept transfer
          </Button>
          <Button
            size="large"
            variant="secondary"
            onClick={declineTransfer}
            isLoading={status?.decline === "pending"}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            Decline transfer
          </Button>
        </div>
      )}
    </div>
  )
}

export default TransferActions
