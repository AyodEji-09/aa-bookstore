import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { WISHLIST_MODULE } from "../modules/wishlist"
import WishlistModuleService from "../modules/wishlist/service"

export type RemoveFromWishlistInput = {
  customer_id: string
  product_id?: string
  id?: string
}

export const removeFromWishlistStep = createStep(
  "remove-from-wishlist",
  async (input: RemoveFromWishlistInput, { container }) => {
    const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)

    const filter: Record<string, unknown> = { customer_id: input.customer_id }
    if (input.id) {
      filter.id = input.id
    } else if (input.product_id) {
      filter.product_id = input.product_id
    }

    const items = await wishlistService.listCustomerWishlistItems(filter)
    if (items?.length) {
      const ids = items.map((i) => i.id)
      await wishlistService.deleteCustomerWishlistItems(ids)
      return new StepResponse({ success: true }, items)
    }

    return new StepResponse({ success: true }, [])
  },
  async (previousItems, { container }) => {
    if (!previousItems?.length) return
    const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)
    await wishlistService.createCustomerWishlistItems(
      previousItems.map((item) => ({
        id: item.id,
        customer_id: item.customer_id,
        product_id: item.product_id,
        variant_id: item.variant_id,
      }))
    )
  }
)

export const removeFromWishlistWorkflow = createWorkflow(
  "remove-from-wishlist",
  (input: RemoveFromWishlistInput) => {
    const result = removeFromWishlistStep(input)
    return new WorkflowResponse(result)
  }
)
