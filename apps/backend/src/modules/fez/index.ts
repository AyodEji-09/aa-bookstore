import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { FezFulfillmentService } from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [FezFulfillmentService],
})
