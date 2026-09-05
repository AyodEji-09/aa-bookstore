import { model } from "@medusajs/framework/utils"

export const CustomerLibraryItem = model.define("customer_library_item", {
  id: model.id().primaryKey(),
  customer_id: model.text().index(),
  product_id: model.text().index(),
  variant_id: model.text().index(),
  format: model.enum(["ebook", "audiobook"]),
  order_id: model.text().index(),
  progress: model.json().nullable(),
  media_key: model.text().nullable(),
})
