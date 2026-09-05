import { Module } from "@medusajs/framework/utils"
import LibraryModuleService from "./service"

export const LIBRARY_MODULE = "library"

export default Module(LIBRARY_MODULE, {
  service: LibraryModuleService,
})
