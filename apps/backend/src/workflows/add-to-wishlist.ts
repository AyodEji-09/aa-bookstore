import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "../modules/wishlist"
import WishlistModuleService from "../modules/wishlist/service"

export type AddToWishlistInput = {
  customer_id: string
  product_id: string
  variant_id?: string | null
}

export const addToWishlistStep = createStep(
  "add-to-wishlist",
  async (input: AddToWishlistInput, { container }) => {
    const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)

    const existing = await wishlistService.listCustomerWishlistItems({
      customer_id: input.customer_id,
      product_id: input.product_id,
    })

    if (existing?.length) {
      return new StepResponse(existing[0], null)
    }

    const created = await wishlistService.createCustomerWishlistItems({
      customer_id: input.customer_id,
      product_id: input.product_id,
      variant_id: input.variant_id || null,
    })

    return new StepResponse(created, created.id)
  },
  async (createdId, { container }) => {
    if (!createdId) return
    const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)
    await wishlistService.deleteCustomerWishlistItems([createdId])
  }
)

export const addToWishlistWorkflow = createWorkflow(
  "add-to-wishlist",
  (input: AddToWishlistInput) => {
    const item = addToWishlistStep(input)
    return new WorkflowResponse(item)
  }
)
