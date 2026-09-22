import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams: {
      ...queryParams,
      limit: 10,
    },
    countryCode,
  })
    .then(({ response }) => {
      return (response?.products || [])
        .filter((responseProduct) => responseProduct.id !== product.id)
        .slice(0, 4)
    })
    .catch(() => [])

  if (!products.length) {
    return null
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#980000] mb-4">
          Related products
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#382C2C] tracking-tight">
          You might also like
        </h2>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 small:grid-cols-4 medium:grid-cols-4 gap-x-2.5 sm:gap-x-4 small:gap-x-6 gap-y-6 small:gap-y-8">
        {products.map((product) => (
          <li key={product.id}>
            <Product region={region} product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
