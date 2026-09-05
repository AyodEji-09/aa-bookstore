import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import FeatureBar from "@modules/home/components/feature-bar"
// import PlaceholderRail from "@modules/home/components/placeholder-rail"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Ayodeji Anifowose Bookstore",
  description:
    "Ayodeji Anifowose Bookstore e-commerce storefront powered by Next.js and Medusa.",
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

      {/* Placeholder Collection Rails matching exact homepage design */}
      {/* <PlaceholderRail title="Selected for you" /> */}
      {/* <PlaceholderRail title="Trending books" /> */}
      {/* <PlaceholderRail title="Recently released ebooks" /> */}

      {/* Dynamic Medusa Collections if present in DB */}
      {region && collections && collections.length > 0 && (
        <div className="py-4">
          <ul className="flex flex-col">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </div>
      )}
    </div>
  )
}
