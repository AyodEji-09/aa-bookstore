import repeat from "@lib/util/repeat"
import SkeletonCartItem from "@modules/skeletons/components/skeleton-cart-item"
import SkeletonOrderSummary from "@modules/skeletons/components/skeleton-order-summary"

const SkeletonCartPage = () => {
  return (
    <div className="py-12">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-10 lg:gap-14 xl:gap-20 items-start">
          <div className="flex flex-col bg-white py-6 gap-y-6">
            <div className="bg-gray-50/60 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 border border-gray-100">
              <div className="space-y-1.5 flex-1">
                <div className="w-40 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-48 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse shrink-0" />
            </div>
            <div>
              <div className="pb-2 flex items-center">
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex flex-col divide-y divide-ui-border-base">
                {repeat(3).map((index) => (
                  <SkeletonCartItem key={index} />
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="flex flex-col gap-y-8">
              <div className="bg-white py-6">
                <SkeletonOrderSummary />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartPage
