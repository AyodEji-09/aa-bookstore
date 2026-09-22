import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
).replace(/\/+$/, "")
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = (process.env.NEXT_PUBLIC_DEFAULT_REGION || "ng").toLowerCase()

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

const REGION_CACHE_TIME = process.env.NEXT_PUBLIC_REVALIDATE_TIME
  ? parseInt(process.env.NEXT_PUBLIC_REVALIDATE_TIME, 10)
  : 15

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    return regionMapCache.regionMap
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - REGION_CACHE_TIME * 1000
  ) {
    try {
      // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        method: "GET",
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
        next: {
          revalidate: REGION_CACHE_TIME,
          tags: [`regions-${cacheId}`],
        },
        cache: "force-cache",
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "")
        console.error(
          `Middleware.ts: Error fetching regions (${response.status}): ${errorText}`
        )
        return regionMapCache.regionMap
      }

      const json = await response.json()
      const { regions } = json

      if (regions?.length) {
        regionMapCache.regionMap.clear()
        // Create a map of country codes to regions.
        regions.forEach((region: HttpTypes.StoreRegion) => {
          region.countries?.forEach((c) => {
            if (c.iso_2) {
              regionMapCache.regionMap.set(c.iso_2.toLowerCase(), region)
            }
          })
        })
        regionMapCache.regionMapUpdated = Date.now()
      }
    } catch (error) {
      console.error("Middleware.ts: Failed to fetch regions from Medusa:", error)
      return regionMapCache.regionMap
    }
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  let countryCode

  const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

  // Cloudflare Workers provides country via request.cf.country or cf-ipcountry header
  const cfCountry =
    (request as { cf?: { country?: string } }).cf?.country?.toLowerCase() ||
    request.headers.get("cf-ipcountry")?.toLowerCase()

  // Common CDN/proxy geo headers: Vercel, Cloudflare, Railway, Fly.io, etc.
  const geoCountry =
    cfCountry ||
    request.headers.get("x-vercel-ip-country")?.toLowerCase() ||
    request.headers.get("x-country-code")?.toLowerCase() ||
    request.headers.get("x-country")?.toLowerCase() ||
    request.headers.get("x-geo-country")?.toLowerCase()

  if (urlCountryCode && regionMap.has(urlCountryCode)) {
    countryCode = urlCountryCode
  } else if (geoCountry && regionMap.has(geoCountry)) {
    countryCode = geoCountry
  } else if (regionMap.has(DEFAULT_REGION)) {
    countryCode = DEFAULT_REGION
  } else if (regionMap.keys().next().value) {
    countryCode = regionMap.keys().next().value
  }

  return countryCode
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = await getCountryCode(request, regionMap)

  // if the country code is available, use it, otherwise use the default region
  const country = countryCode || DEFAULT_REGION
  const firstPathSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
  const urlHasCountry = firstPathSegment === country.toLowerCase()

  if (urlHasCountry) {
    if (!cacheIdCookie) {
      const response = NextResponse.next()
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
      return response
    }
    return NextResponse.next()
  }

  // if the url doesn't have the country, redirect to it
  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const queryString = request.nextUrl.search || ""
  const redirectUrl = `${request.nextUrl.origin}/${country}${redirectPath}${queryString}`

  return NextResponse.redirect(redirectUrl, 307)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
