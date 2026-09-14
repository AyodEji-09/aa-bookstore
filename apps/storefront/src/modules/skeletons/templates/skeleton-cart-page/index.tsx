import repeat from "@lib/util/repeat"
import SkeletonCartItem from "@modules/skeletons/components/skeleton-cart-item"
import SkeletonCodeForm from "@modules/skeletons/components/skeleton-code-form"
import SkeletonOrderSummary from "@modules/skeletons/components/skeleton-order-summary"

const SkeletonCartPage = () => {
  return (
    <div className="py-8 sm:py-12">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-10 lg:gap-14 xl:gap-20 items-start">
          <div className="flex flex-col gap-y-6">
            <div className="pb-4 sm:pb-6 border-b border-gray-200 flex items-baseline justify-between">
              <div className="w-36 h-8 bg-gray-100 rounded animate-pulse" />
              <div className="w-14 h-4 bg-gray-100 rounded animate-pulse" />
            </div>

            <div className="divide-y divide-gray-200">
              {repeat(3).map((index) => (
                <SkeletonCartItem key={index} />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-col gap-y-6 sticky top-20">
              <div className="w-36 h-7 bg-gray-100 rounded animate-pulse pb-4 border-b border-gray-200" />
              <SkeletonCodeForm />
              <SkeletonOrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartPage
