import { Metadata } from "next"
import { Suspense } from "react"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import FeatureBar from "@modules/home/components/feature-bar"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"
import repeat from "@lib/util/repeat"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Ayodeji Anifowose Store",
  description:
    "Official store of author Ayodeji Anifowose. Discover books, digital editions, audiobooks, and exclusive releases.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  return (
    <div className="bg-white">
      <Hero />
      <FeatureBar />

      {/* Dynamic Medusa Collections streamed via Suspense */}
      {region && collections && collections.length > 0 && (
        <div className="py-4">
          <ul className="flex flex-col">
            <Suspense
              fallback={
                <div className="content-container py-10 space-y-12">
                  <div className="space-y-4">
                    <div className="w-48 h-8 rounded-lg animate-pulse bg-gray-200" />
                    <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {repeat(4).map((i) => (
                        <li key={i}>
                          <SkeletonProductPreview />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              }
            >
              <FeaturedProducts collections={collections} region={region} />
            </Suspense>
          </ul>
        </div>
      )}
    </div>
  )
}
