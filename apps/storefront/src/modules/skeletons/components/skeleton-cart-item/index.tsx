const SkeletonCartItem = () => {
  return (
    <div className="py-5 sm:py-6 flex gap-3.5 sm:gap-6 items-start border-b border-gray-100 last:border-b-0">
      <div className="w-20 h-28 sm:w-24 sm:h-32 bg-gray-100 rounded-lg sm:rounded-xl shrink-0 animate-pulse" />
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="w-2/3 space-y-1.5">
              <div className="w-16 h-3 bg-gray-100 rounded animate-pulse" />
              <div className="w-full h-4 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="w-4 h-4 bg-gray-100 rounded animate-pulse shrink-0" />
          </div>
          <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="w-24 h-3 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="w-12 h-8 bg-gray-100 rounded animate-pulse" />
          <div className="w-24 h-3 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartItem
