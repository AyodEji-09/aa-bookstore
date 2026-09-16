import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
        <div className="w-28 h-4 rounded-full animate-pulse bg-gray-100 mb-2"></div>
        <div className="w-64 h-8 rounded-lg animate-pulse bg-gray-100"></div>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 small:grid-cols-4 medium:grid-cols-4 gap-x-2.5 sm:gap-x-4 small:gap-x-6 gap-y-6 small:gap-y-8 flex-1">
        {repeat(4).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonRelatedProducts
