import SkeletonButton from "@modules/skeletons/components/skeleton-button"
import SkeletonCartTotals from "@modules/skeletons/components/skeleton-cart-totals"

const SkeletonOrderSummary = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
      <div className="w-36 h-4 bg-gray-200 rounded animate-pulse my-1" />
      <div className="w-full h-px bg-gray-200" />
      <SkeletonCartTotals header={false} />
      <SkeletonButton />
    </div>
  )
}

export default SkeletonOrderSummary
