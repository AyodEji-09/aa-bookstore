import { MedusaService } from "@medusajs/framework/utils"
import { CustomerLibraryItem } from "./models/library-item"

export default class LibraryModuleService extends MedusaService({
  CustomerLibraryItem,
}) {}
