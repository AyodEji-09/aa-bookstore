import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { LIBRARY_MODULE } from "../modules/library"
import LibraryModuleService from "../modules/library/service"

export type UpdateLibraryProgressInput = {
  id: string
  progress: Record<string, any>
}

export const updateLibraryProgressStep = createStep(
  "update-library-progress",
  async (input: UpdateLibraryProgressInput, { container }) => {
    const libraryService: LibraryModuleService = container.resolve(LIBRARY_MODULE)
    const [previousItem] = await libraryService.listCustomerLibraryItems({
      id: input.id,
    })

    const [updated] = await libraryService.updateCustomerLibraryItems([
      {
        id: input.id,
        progress: input.progress,
      },
    ])

    return new StepResponse(updated, {
      id: input.id,
      previousProgress: previousItem?.progress,
    })
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }
    const libraryService: LibraryModuleService = container.resolve(LIBRARY_MODULE)
    await libraryService.updateCustomerLibraryItems([
      {
        id: compensationData.id,
        progress: compensationData.previousProgress,
      },
    ])
  }
)

export const updateLibraryProgressWorkflow = createWorkflow(
  "update-library-progress",
  (input: UpdateLibraryProgressInput) => {
    const updated = updateLibraryProgressStep(input)
    return new WorkflowResponse(updated)
  }
)
