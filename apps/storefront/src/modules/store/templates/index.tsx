import { Suspense } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listProductOptions } from "@lib/data/products"
import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const productOptions = await listProductOptions()

  return (
    <div className="bg-white min-h-screen">
      {/* Category / Store Header Banner */}
      <div className="bg-white py-10 pb-6">
        <div className="content-container">
          <nav className="flex items-center gap-x-2 text-xs text-gray-500 mb-4 font-medium">
            <LocalizedClientLink
              href="/"
              className="hover:text-[#980000] transition-colors"
            >
              Home
            </LocalizedClientLink>
            <span>&gt;</span>
            <span className="text-[#382C2C] font-semibold">Store</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#382C2C] tracking-tight">
            Book Store Catalog
          </h1>
          <p className="text-sm text-[#4D4C4C] mt-2 max-w-xl">
            Explore the complete collection of award-winning novels, audiobooks,
            plays, and memoirs by Ayodeji Anifowose.
          </p>
        </div>
      </div>

      {/* Main Catalog Grid Content with Generous Bottom Padding */}
      <div
        className="content-container pt-4 pb-28 sm:pb-36"
        data-testid="category-container"
      >
        <RefinementList sortBy={sort} productOptions={productOptions}>
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
            />
          </Suspense>
        </RefinementList>
      </div>
    </div>
  )
}

export default StoreTemplate
