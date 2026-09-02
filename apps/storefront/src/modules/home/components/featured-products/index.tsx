import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  return Promise.all(
    collections.map(async (collection) => {
      const {
        response: { products: pricedProducts },
      } = await listProducts({
        regionId: region.id,
        queryParams: {
          collection_id: collection.id,
          fields: "*variants.calculated_price",
        },
      })

      if (!pricedProducts || pricedProducts.length === 0) {
        return null
      }

      return (
        <li key={collection.id}>
          <ProductRail collection={collection} region={region} products={pricedProducts} />
        </li>
      )
    })
  )
}
