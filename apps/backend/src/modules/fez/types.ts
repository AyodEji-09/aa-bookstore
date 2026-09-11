export interface FezOptions {
  baseUrl?: string
  userId?: string
  password?: string
  secretKey?: string
  defaultPickupState?: string
  defaultPickupAddress?: string
  defaultSenderPhone?: string
  defaultSenderName?: string
}

export interface FezAuthResponse {
  status: string
  description: string
  authDetails?: {
    authToken: string
    expireToken: string
  }
  userDetails?: {
    userID: string
    [key: string]: unknown
  }
  orgDetails?: {
    "secret-key": string
    "Org Full Name": string
  }
}

export interface FezCostRequest {
  state: string
  pickUpState?: string
  weight?: number
  locker?: boolean
}

export interface FezCostResponse {
  status: string
  description: string
  cost?: {
    state: string
    cost: number
  }
  vat?: {
    vatAmount: number
    vatPercent: string
  }
  totalCost?: number
}

export interface FezOrderPayload {
  recipientAddress: string
  recipientState: string
  recipientName: string
  recipientPhone: string
  recipientEmail?: string
  uniqueID: string
  BatchID: string
  valueOfItem: string
  weight?: number
  itemDescription?: string
  additionalDetails?: string
  pickUpState?: string
  pickUpAddress?: string
  thirdparty?: string
  senderName?: string
  senderAddress?: string
  senderPhone?: string
  [key: string]: unknown
}

export interface FezOrderResponse {
  status: string
  description: string
  orderNos?: Record<string, string>
}

export interface FezCancelResponse {
  status: string
  description: string
}

export interface FezWebhookPayload {
  orderNumber: string
  status: string
  [key: string]: unknown
}

export interface FezStateItem {
  id: number
  state: string
}

export interface FezStatesResponse {
  status: string
  description: string
  states?: FezStateItem[]
}

