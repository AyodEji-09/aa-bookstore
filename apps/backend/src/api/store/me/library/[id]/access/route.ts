import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LIBRARY_MODULE } from "../../../../../../modules/library"
import LibraryModuleService from "../../../../../../modules/library/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const itemId = req.params.id
  const libraryService: LibraryModuleService = req.scope.resolve(LIBRARY_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const items = await libraryService.listCustomerLibraryItems({
    id: itemId,
    customer_id: customerId,
  })

  const item = items?.[0]
  if (!item) {
    res.status(404).json({ message: "Digital book not found in your library" })
    return
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "description", "thumbnail", "metadata"],
    filters: { id: item.product_id },
  })

  const product = products?.[0]

  // Mock sample chapters for reader and audio tracks for streaming player
  // In production with R2, presigned streaming chunk URLs or secure chapter JSONs are generated here
  const sampleAudioTracks = [
    {
      id: 1,
      title: "Prologue - The Letter",
      duration: 312,
      streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: 2,
      title: "Chapter 1 - Sunday Morning",
      duration: 480,
      streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: 3,
      title: "Chapter 2 - The Encounter",
      duration: 540,
      streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
  ]

  const sampleEbookChapters = [
    {
      id: 1,
      title: "Prologue",
      content: [
        "My name is Oscar, I am ten years old, I have set fire to the cat, the dog, the house (I think I even toasted the goldfish) and this is the first letter I am sending to you because before, I didn't have time on account of my studies.",
        "I need to warn you right away: I hate writing. I only do it because Granny Rose told me that if you write to God, He might answer, or at least it might make things lighter.",
        "Here at the hospital, everyone is kind, but everyone has that look when they know something you don't know.",
      ],
    },
    {
      id: 2,
      title: "Chapter 1 - Granny Rose",
      content: [
        "Granny Rose is the oldest of the pink ladies who visit the children. She claims she used to be a professional wrestler named the Strangler of Languedoc. None of the other nurses believe her, but I do.",
        "She told me: Oscar, life is a funny gift. In the beginning, we overestimate it: we think we've been given eternal life. Then we underestimate it: we find it rotten, too short, we're almost ready to throw it away. In the end, we realize that it wasn't a gift, just a loan. So we try to deserve it.",
      ],
    },
    {
      id: 3,
      title: "Chapter 2 - The Twelve Days",
      content: [
        "Today Granny Rose made a proposition: 'From now on, Oscar, you will pretend that every single day is worth ten years of your life. That way, in twelve days, you will have lived one hundred and twenty years.'",
        "It sounded like a game, but like all of Granny Rose's games, it felt truer than the medicine.",
      ],
    },
  ]

  res.json({
    item: {
      id: item.id,
      format: item.format,
      progress: item.progress || {
        last_chapter: 1,
        completed: false,
        timestamp_seconds: 0,
      },
      product: {
        id: product?.id,
        title: product?.title || "Digital Book",
        author: (product?.metadata?.author as string) || "Eric-Emmanuel Schmitt",
        thumbnail: product?.thumbnail,
      },
      // Stream / Reader payload: Content is strictly served in-memory for the web client
      tracks: item.format === "audiobook" ? sampleAudioTracks : undefined,
      chapters: item.format === "ebook" ? sampleEbookChapters : undefined,
    },
  })
}
