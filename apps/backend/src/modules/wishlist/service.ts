import { MedusaService } from "@medusajs/framework/utils"
import { CustomerWishlistItem } from "./models/wishlist-item"

export default class WishlistModuleService extends MedusaService({
  CustomerWishlistItem,
}) {}
