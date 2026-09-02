import { notFound } from "next/navigation"
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category) {
      parents.push(cat.parent_category)
      getParents(cat.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="bg-white min-h-screen">
      {/* Category Header Banner */}
      <div className="bg-gradient-to-b from-red-50/40 via-white to-white py-10 pb-6">
        <div className="content-container">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-x-2 text-xs text-gray-500 mb-4 font-medium">
            <LocalizedClientLink
              href="/"
              className="hover:text-[#980000] transition-colors"
            >
              Home
            </LocalizedClientLink>
            <span>&gt;</span>
            <LocalizedClientLink
              href="/store"
              className="hover:text-[#980000] transition-colors"
            >
              Categories
            </LocalizedClientLink>
            {parents.map((parent) => (
              <span key={parent.id} className="flex items-center gap-x-2">
                <span>&gt;</span>
                <LocalizedClientLink
                  href={`/categories/${parent.handle}`}
                  className="hover:text-[#980000] transition-colors"
                >
                  {parent.name}
                </LocalizedClientLink>
              </span>
            ))}
            <span>&gt;</span>
            <span className="text-[#382C2C] font-semibold">
              {category.name}
            </span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#382C2C] tracking-tight">
            {category.name}
          </h1>

          {category.description && (
            <p className="text-sm text-[#4D4C4C] mt-2 max-w-xl">
              {category.description}
            </p>
          )}

          {/* Subcategory Pills */}
          {category.category_children &&
            category.category_children.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {category.category_children.map((c) => (
                  <LocalizedClientLink
                    key={c.id}
                    href={`/categories/${c.handle}`}
                    className="px-4 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-[#4D4C4C] hover:border-[#980000] hover:text-[#980000] hover:bg-red-50/50 transition-all"
                  >
                    {c.name}
                  </LocalizedClientLink>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Main Category Products Content with Generous Bottom Padding */}
      <div
        className="content-container pt-6 pb-28 sm:pb-36 flex flex-col small:flex-row small:items-start gap-8"
        data-testid="category-container"
      >
        <RefinementList
          sortBy={sort}
          data-testid="sort-by-container"
          hideOptionsPicker
        />

        <div className="w-full flex-1">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={category.products?.length ?? 8}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
