import { model } from "@medusajs/framework/utils"

export const CustomerWishlistItem = model.define("customer_wishlist_item", {
  id: model.id().primaryKey(),
  customer_id: model.text().index(),
  product_id: model.text().index(),
  variant_id: model.text().nullable(),
})
