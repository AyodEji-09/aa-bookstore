import { Logger } from "@medusajs/framework/types"
import {
  FezAuthResponse,
  FezCancelResponse,
  FezCostRequest,
  FezCostResponse,
  FezOptions,
  FezOrderPayload,
  FezOrderResponse,
  FezStatesResponse,
} from "./types"

export class FezClient {
  private baseUrl: string
  private userId?: string
  private password?: string
  private secretKey?: string
  private logger: Logger

  private cachedToken: string | null = null
  private tokenExpiresAt: number | null = null
  private cachedStates: string[] | null = null

  constructor(options: FezOptions, logger: Logger) {
    this.baseUrl = (options.baseUrl || "https://apisandbox.fezdelivery.co/v1").replace(/\/$/, "")
    this.userId = options.userId
    this.password = options.password
    this.secretKey = options.secretKey
    this.logger = logger
  }

  public isConfigured(): boolean {
    return Boolean(this.secretKey && this.userId && this.password)
  }

  private async getAuthToken(): Promise<string | null> {
    if (!this.userId || !this.password) {
      return null
    }

    // Return cached token if valid with 5-minute safety buffer
    const now = Date.now()
    if (this.cachedToken && this.tokenExpiresAt && this.tokenExpiresAt - 300000 > now) {
      return this.cachedToken
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: this.userId,
          password: this.password,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        this.logger.error(`Fez authentication failed [${response.status}]: ${errorText}`)
        return null
      }

      const data: FezAuthResponse = await response.json()
      if (data.status === "Success" && data.authDetails?.authToken) {
        this.cachedToken = data.authDetails.authToken

        if (data.authDetails.expireToken) {
          const parsedExpiry = new Date(data.authDetails.expireToken).getTime()
          this.tokenExpiresAt = isNaN(parsedExpiry) ? now + 3600000 : parsedExpiry
        } else {
          this.tokenExpiresAt = now + 3600000
        }

        return this.cachedToken
      }

      this.logger.error(`Fez auth response not successful: ${JSON.stringify(data)}`)
      return null
    } catch (error) {
      this.logger.error(`Fez authentication exception: ${error}`)
      return null
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.secretKey) {
      headers["secret-key"] = this.secretKey
    }

    const token = await this.getAuthToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  public async fetchDeliveryCost(payload: FezCostRequest): Promise<FezCostResponse | null> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${this.baseUrl}/order/cost`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        this.logger.error(`Fez fetchDeliveryCost failed [${response.status}]: ${errorText}`)
        return null
      }

      return (await response.json()) as FezCostResponse
    } catch (error) {
      this.logger.error(`Fez fetchDeliveryCost error: ${error}`)
      return null
    }
  }

  public async createOrder(payloads: FezOrderPayload[]): Promise<FezOrderResponse | null> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${this.baseUrl}/order`, {
        method: "POST",
        headers,
        body: JSON.stringify(payloads),
      })

      if (!response.ok) {
        const errorText = await response.text()
        this.logger.error(`Fez createOrder failed [${response.status}]: ${errorText}`)
        try {
          return JSON.parse(errorText) as FezOrderResponse
        } catch {
          return null
        }
      }

      return (await response.json()) as FezOrderResponse
    } catch (error) {
      this.logger.error(`Fez createOrder error: ${error}`)
      return null
    }
  }

  public async cancelOrder(orderNumber: string): Promise<FezCancelResponse | null> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${this.baseUrl}/order/cancel`, {
        method: "POST",
        headers,
        body: JSON.stringify({ orderNumber }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        this.logger.error(`Fez cancelOrder failed [${response.status}]: ${errorText}`)
        return null
      }

      return (await response.json()) as FezCancelResponse
    } catch (error) {
      this.logger.error(`Fez cancelOrder error: ${error}`)
      return null
    }
  }

  public async fetchStates(): Promise<string[]> {
    if (this.cachedStates && this.cachedStates.length > 0) {
      return this.cachedStates
    }

    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${this.baseUrl}/states`, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        this.logger.error(`Fez fetchStates failed [${response.status}]: ${errorText}`)
        return []
      }

      const data = (await response.json()) as FezStatesResponse
      if (data?.status === "Success" && Array.isArray(data.states)) {
        const states = data.states
          .map((s) => s.state?.trim())
          .filter((s): s is string => Boolean(s))

        states.sort((a, b) => a.localeCompare(b))
        this.cachedStates = states
        return states
      }

      return []
    } catch (error) {
      this.logger.error(`Fez fetchStates error: ${error}`)
      return []
    }
  }

  public async normalizeState(rawState: string): Promise<string> {
    if (!rawState) {
      return "Lagos"
    }

    const trimmed = rawState.trim()
    const validStates = await this.fetchStates()

    // 1. Direct case-insensitive match against Fez states
    const directMatch = validStates.find(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    )
    if (directMatch) {
      return directMatch
    }

    // 2. Abuja / Federal Capital Territory -> FCT (Fez canonical name is "FCT")
    if (/^(abuja|fct|federal capital territory)$/i.test(trimmed)) {
      const fctMatch = validStates.find((s) => s.toUpperCase() === "FCT")
      return fctMatch || "FCT"
    }

    // 3. Remove trailing " State" (e.g. "Oyo State" -> "Oyo")
    const stripped = trimmed.replace(/\s+state$/i, "").trim()
    const strippedMatch = validStates.find(
      (s) => s.toLowerCase() === stripped.toLowerCase()
    )
    if (strippedMatch) {
      return strippedMatch
    }

    return trimmed
  }
}

let defaultClient: FezClient | null = null

export function getFezClient(logger: Logger): FezClient {
  if (!defaultClient) {
    defaultClient = new FezClient(
      {
        baseUrl: process.env.FEZ_BASE_URL || "https://apisandbox.fezdelivery.co/v1",
        userId: process.env.FEZ_USER_ID,
        password: process.env.FEZ_PASSWORD,
        secretKey: process.env.FEZ_SECRET_KEY,
        defaultPickupState: process.env.FEZ_PICKUP_STATE || "Lagos",
        defaultPickupAddress: process.env.FEZ_PICKUP_ADDRESS || "Lagos Warehouse",
        defaultSenderPhone: process.env.FEZ_SENDER_PHONE || "08000000000",
        defaultSenderName: process.env.FEZ_SENDER_NAME || "Ayollc Bookstore",
      },
      logger
    )
  }
  return defaultClient
}

