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

export async function getLibraryItemAccess(
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
