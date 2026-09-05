import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LIBRARY_MODULE } from "../../../../../../modules/library"
import LibraryModuleService from "../../../../../../modules/library/service"
import { updateLibraryProgressWorkflow } from "../../../../../../workflows/update-library-progress"

type UpdateProgressBody = {
  last_chapter?: number
  timestamp_seconds?: number
  completed?: boolean
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateProgressBody>,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const itemId = req.params.id
  const libraryService: LibraryModuleService = req.scope.resolve(LIBRARY_MODULE)

  const items = await libraryService.listCustomerLibraryItems({
    id: itemId,
    customer_id: customerId,
  })

  const item = items?.[0]
  if (!item) {
    res.status(404).json({ message: "Digital book not found in your library" })
    return
  }

  const updatedProgress = {
    ...(item.progress || {}),
    ...(req.body || {}),
  }

  const { result } = await updateLibraryProgressWorkflow(req.scope).run({
    input: {
      id: item.id,
      progress: updatedProgress,
    },
  })

  res.json({
    message: "Progress updated",
    progress: result?.progress ?? updatedProgress,
  })
}
