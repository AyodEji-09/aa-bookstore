"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type LibraryItem = {
  id: string
  format: "ebook" | "audiobook"
  progress: {
    last_chapter?: number
    completed?: boolean
    timestamp_seconds?: number
  }
  product: {
    id: string
    title: string
    description?: string
    thumbnail?: string
    handle?: string
    author?: string
    publisher?: string
    narrator?: string
    duration?: string
    category?: string
  } | null
  created_at: string
}

export type AudiobookTrack = {
  id: number
  title: string
  duration: number
  streamUrl: string
}

export type EbookChapter = {
  id: number
  title: string
  content: string[]
}

export type LibraryAccessPayload = {
  item: {
    id: string
    format: "ebook" | "audiobook"
    progress: {
      last_chapter?: number
      completed?: boolean
      timestamp_seconds?: number
    }
    product: {
      id: string
      title: string
      author: string
      thumbnail?: string
    }
    file_url?: string | null
    media_key?: string | null
    has_document?: boolean
    document_type?: "pdf" | "epub" | "chapters"
    tracks?: AudiobookTrack[]
    chapters?: EbookChapter[]
  }
}

export async function listLibraryItems(): Promise<LibraryItem[]> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    return []
  }

  try {
    const res = await sdk.client.fetch<{ items: LibraryItem[] }>(
      "/store/me/library",
      {
        method: "GET",
        headers: {
          ...authHeaders,
        },
        cache: "no-store",
      }
    )

    return res?.items || []
  } catch (error) {
    console.error("Failed to fetch customer library items", error)
    return []
  }
}

/**
 * Server-only function used by streaming API route handlers.
 * Preserves the upstream file_url for server-side proxying.
 */
export async function getLibraryItemAccessInternal(
  itemId: string
): Promise<LibraryAccessPayload | null> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    return null
  }

  try {
    const res = await sdk.client.fetch<LibraryAccessPayload>(
      `/store/me/library/${itemId}/access`,
      {
        method: "GET",
        headers: {
          ...authHeaders,
        },
        cache: "no-store",
      }
    )

    return res
  } catch (error) {
    console.error(`Failed to get access for library item ${itemId}`, error)
    return null
  }
}

/**
 * Public Server Action called by client components.
 * Strips raw Cloudflare R2 / S3 URLs so they are NEVER sent to the browser.
 */
export async function getLibraryItemAccess(
  itemId: string
): Promise<LibraryAccessPayload | null> {
  const data = await getLibraryItemAccessInternal(itemId)
  if (!data || !data.item) {
    return null
  }

  const rawUrl = data.item.file_url || data.item.media_key || ""
  const isAudio = data.item.format === "audiobook"
  const hasDoc = Boolean(rawUrl && !isAudio)
  const docType = rawUrl.toLowerCase().includes(".pdf")
    ? "pdf"
    : rawUrl.toLowerCase().includes(".epub")
    ? "epub"
    : "chapters"

  const sanitizedTracks = isAudio
    ? (data.item.tracks || [{ id: 1, title: data.item.product.title, duration: 3600, streamUrl: "" }]).map(
        (track, idx) => ({
          ...track,
          streamUrl: `/api/library/${itemId}/audio?track=${idx}`,
        })
      )
    : undefined

  return {
    item: {
      ...data.item,
      // Security: Never leak raw storage URLs to the browser client
      file_url: null,
      media_key: null,
      has_document: hasDoc,
      document_type: docType,
      tracks: sanitizedTracks,
    },
  }
}

export async function updateLibraryProgress(
  itemId: string,
  progress: {
    last_chapter?: number
    timestamp_seconds?: number
    completed?: boolean
  }
) {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders) {
    return null
  }

  try {
    return await sdk.client.fetch(
      `/store/me/library/${itemId}/progress`,
      {
        method: "POST",
        body: progress,
        headers: {
          ...authHeaders,
        },
      }
    )
  } catch (error) {
    console.error(`Failed to update library progress for item ${itemId}`, error)
    return null
  }
}
