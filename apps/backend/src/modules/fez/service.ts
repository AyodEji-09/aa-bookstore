import {
  AbstractFulfillmentProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  CalculatedShippingOptionPrice,
  CreateFulfillmentResult,
  FulfillmentOption,
  Logger,
} from "@medusajs/framework/types"
import { FezClient } from "./client"
import { FezOptions, FezOrderPayload } from "./types"

interface InjectedDependencies {
  logger: Logger
}

export class FezFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "fez"
  protected options_: FezOptions
  protected logger_: Logger
  protected client_: FezClient

  constructor({ logger }: InjectedDependencies, options: FezOptions) {
    super()
    this.logger_ = logger
    this.options_ = {
      baseUrl: options?.baseUrl || process.env.FEZ_BASE_URL,
      userId: options?.userId || process.env.FEZ_USER_ID,
      password: options?.password || process.env.FEZ_PASSWORD,
      secretKey: options?.secretKey || process.env.FEZ_SECRET_KEY,
      defaultPickupState:
        options?.defaultPickupState || process.env.FEZ_PICKUP_STATE || "Lagos",
      defaultPickupAddress:
        options?.defaultPickupAddress ||
        process.env.FEZ_PICKUP_ADDRESS ||
        "Lagos, Nigeria",
      defaultSenderPhone:
        options?.defaultSenderPhone ||
        process.env.FEZ_SENDER_PHONE ||
        "08000000000",
      defaultSenderName:
        options?.defaultSenderName ||
        process.env.FEZ_SENDER_NAME ||
        "Ayodeji Anifowose Bookstore",
    }

    this.client_ = new FezClient(this.options_, this.logger_)
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      {
        id: "fez-standard",
        name: "Fez Delivery",
        is_return: false,
      },
    ]
  }

  async getStates(): Promise<string[]> {
    return this.client_.fetchStates()
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: any
  ): Promise<any> {
    return data
  }

  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    const id = (data?.id as string) || (data?.optionData as any)?.id
    return id === "fez-standard" || id === "fez-express"
  }

  async canCalculate(data: any): Promise<boolean> {
    return true
  }

  async calculatePrice(
    optionData: any,
    data: any,
    context: any
  ): Promise<CalculatedShippingOptionPrice> {
    // Default fallback fee if API is unconfigured (in NGN, e.g. 2,500 NGN)
    const fallbackPrice = 2500

    const shippingAddress =
      context?.shipping_address ||
      context?.cart?.shipping_address ||
      context?.order?.shipping_address

    const provinceOrState =
      shippingAddress?.province ||
      shippingAddress?.city ||
      (data?.state as string)

    const countryCode = shippingAddress?.country_code?.toLowerCase()

    // Fez operates within Nigeria
    if (countryCode && countryCode !== "ng") {
      return {
        calculated_amount: fallbackPrice,
        is_calculated_price_tax_inclusive: true,
      }
    }

    if (!provinceOrState || !this.client_.isConfigured()) {
      return {
        calculated_amount: fallbackPrice,
        is_calculated_price_tax_inclusive: true,
      }
    }

    // Determine weight from context if available, hierarchy: item.variant.weight -> item.weight -> 0.5kg
    const items = context?.items || context?.cart?.items || []
    let totalWeight = 0
    for (const item of items) {
      const variantWeight = item?.variant?.weight
      const itemWeight = item?.weight
      const unitWeight =
        typeof variantWeight === "number" && variantWeight > 0
          ? variantWeight
          : typeof itemWeight === "number" && itemWeight > 0
          ? itemWeight
          : 0.5

      const quantity = (item?.quantity as number) || 1
      totalWeight += unitWeight * quantity
    }
    const weightInKg = totalWeight > 0 ? Number(totalWeight.toFixed(2)) : 0.5

    const targetState = await this.client_.normalizeState(provinceOrState)

    const costResponse = await this.client_.fetchDeliveryCost({
      state: targetState,
      pickUpState: this.options_.defaultPickupState,
      weight: weightInKg,
    })

    if (costResponse && costResponse.totalCost) {
      // In Medusa v2, prices are stored in major currency units (e.g. 5875 NGN)
      return {
        calculated_amount: costResponse.totalCost,
        is_calculated_price_tax_inclusive: true,
      }
    }

    return {
      calculated_amount: fallbackPrice,
      is_calculated_price_tax_inclusive: true,
    }
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: any[],
    order: any,
    fulfillment: any,
    additionalData?: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    const shippingAddress = order?.shipping_address
    if (!shippingAddress) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cannot create Fez fulfillment without a shipping address."
      )
    }

    const rawState =
      shippingAddress.province || shippingAddress.city || "Lagos"
    const recipientState = await this.client_.normalizeState(rawState)
    const recipientAddress = [
      shippingAddress.address_1,
      shippingAddress.address_2,
      shippingAddress.city,
    ]
      .filter(Boolean)
      .join(", ")

    const recipientName = [shippingAddress.first_name, shippingAddress.last_name]
      .filter(Boolean)
      .join(" ") || "Customer"

    const recipientPhone =
      shippingAddress.phone || (data?.recipientPhone as string) || "08000000000"

    const uniqueID = `BK-${fulfillment?.id || Date.now()}`
    const batchID = `BATCH-${order?.id || Date.now()}`

    let totalWeight = 0
    for (const item of items) {
      const variantWeight = item?.variant?.weight
      const itemWeight = item?.weight
      const weight =
        typeof variantWeight === "number" && variantWeight > 0
          ? variantWeight
          : typeof itemWeight === "number" && itemWeight > 0
          ? itemWeight
          : 0.5
      totalWeight += weight * (item?.quantity || 1)
    }

    const payload: FezOrderPayload = {
      recipientAddress,
      recipientState,
      recipientName,
      recipientPhone,
      recipientEmail: order?.email || "",
      uniqueID,
      BatchID: batchID,
      valueOfItem: String(Math.round(order?.total || 10000)),
      weight: totalWeight > 0 ? Number(totalWeight.toFixed(2)) : 0.5,
      itemDescription: `Book order ${order?.display_id || order?.id || ""}`,
      pickUpState: this.options_.defaultPickupState,
      pickUpAddress: this.options_.defaultPickupAddress,
      thirdparty: "true",
      senderName: this.options_.defaultSenderName,
      senderAddress: this.options_.defaultPickupAddress,
      senderPhone: this.options_.defaultSenderPhone,
    }

    let fezOrderNo = uniqueID
    if (this.client_.isConfigured()) {
      const fezResponse = await this.client_.createOrder([payload])
      if (fezResponse?.status === "Success" && fezResponse.orderNos) {
        fezOrderNo =
          fezResponse.orderNos[uniqueID] ||
          Object.values(fezResponse.orderNos)[0] ||
          uniqueID
      } else {
        const specificError =
          fezResponse?.orderNos?.[uniqueID] ||
          (fezResponse?.orderNos && Object.values(fezResponse.orderNos)[0]) ||
          fezResponse?.description ||
          "Failed to dispatch order with Fez Delivery"

        this.logger_.error(
          `Fez createOrder failed: ${JSON.stringify(fezResponse)}`
        )

        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Fez Delivery error: ${specificError}`
        )
      }
    } else {
      this.logger_.info(
        `Fez credentials not configured. Mocking fulfillment with ID: ${uniqueID}`
      )
    }

    return {
      data: {
        fez_order_number: fezOrderNo,
        unique_id: uniqueID,
        batch_id: batchID,
        status: "Pending Pick-Up",
        recipient_state: recipientState,
      },
      labels: [
        {
          tracking_number: fezOrderNo,
          tracking_url: `https://web.fezdelivery.co/track-delivery?trackingNumber=${fezOrderNo}`,
          label_url: "",
        },
      ],
    }
  }

  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<any> {
    const fezOrderNo =
      (fulfillment?.data as any)?.fez_order_number ||
      (fulfillment?.data as any)?.unique_id

    if (fezOrderNo && this.client_.isConfigured()) {
      await this.client_.cancelOrder(fezOrderNo)
    }

    return {
      status: "canceled",
    }
  }

  async createReturnFulfillment(fromData: Record<string, unknown>): Promise<CreateFulfillmentResult> {
    return {
      data: fromData,
      labels: [],
    }
  }

  async getFulfillmentDocuments(data: Record<string, unknown>): Promise<any> {
    return []
  }

  async getReturnDocuments(data: Record<string, unknown>): Promise<any> {
    return []
  }

  async getShipmentDocuments(data: Record<string, unknown>): Promise<any> {
    return []
  }

  async retrieveDocuments(fulfillmentData: Record<string, unknown>, documentType: string): Promise<any> {
    return []
  }
}
