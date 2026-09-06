import { getLibraryItemAccessInternal } from "@lib/data/library"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await getLibraryItemAccessInternal(id)

  if (!access || !access.item?.file_url) {
    return new NextResponse("Unauthorized or file not found", { status: 404 })
  }

  const fileUrl = access.item.file_url

  try {
    const upstreamRes = await fetch(fileUrl)
    if (!upstreamRes.ok) {
      return new NextResponse("Failed to load file upstream", {
        status: upstreamRes.status,
      })
    }

    const contentType = upstreamRes.headers.get("content-type") || "application/pdf"
    const buffer = await upstreamRes.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-transform, max-age=3600",
      },
    })
  } catch (err) {
    console.error("Error streaming document", err)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
