import { getLibraryItemAccessInternal } from "@lib/data/library"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await getLibraryItemAccessInternal(id)

  if (!access || access.item?.format !== "audiobook") {
    return new NextResponse("Unauthorized or not an audiobook", { status: 404 })
  }

  const trackIndex = parseInt(req.nextUrl.searchParams.get("track") || "0", 10)
  const track = access.item.tracks?.[trackIndex] || access.item.tracks?.[0]
  const audioUrl = track?.streamUrl || access.item.file_url

  if (!audioUrl) {
    return new NextResponse("No audio source available", { status: 404 })
  }

  try {
    const range = req.headers.get("range")
    const upstreamHeaders: HeadersInit = {}
    if (range) {
      upstreamHeaders["Range"] = range
    }

    const upstreamRes = await fetch(audioUrl, {
      headers: upstreamHeaders,
    })

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return new NextResponse("Failed to stream upstream audio", {
        status: upstreamRes.status,
      })
    }

    const contentType =
      upstreamRes.headers.get("content-type") || "audio/mpeg"
    const contentLength = upstreamRes.headers.get("content-length")
    const contentRange = upstreamRes.headers.get("content-range")
    const acceptRanges = upstreamRes.headers.get("accept-ranges") || "bytes"

    const headers = new Headers()
    headers.set("Content-Type", contentType)
    headers.set("Accept-Ranges", acceptRanges)
    headers.set("Content-Disposition", "inline")
    headers.set("X-Content-Type-Options", "nosniff")
    if (contentLength) headers.set("Content-Length", contentLength)
    if (contentRange) headers.set("Content-Range", contentRange)
    headers.set("Cache-Control", "private, no-transform, max-age=3600")

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status === 206 ? 206 : 200,
      headers,
    })
  } catch (err) {
    console.error("Audio streaming error:", err)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
