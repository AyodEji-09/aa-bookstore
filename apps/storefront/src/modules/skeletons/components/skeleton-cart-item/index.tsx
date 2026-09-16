const SkeletonCartItem = () => {
  return (
    <div className="py-4 sm:py-6 flex gap-3 sm:gap-6 items-start">
      <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gray-200 rounded-md animate-pulse shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch gap-y-3 sm:gap-y-4">
        <div className="flex items-start justify-between gap-x-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="w-36 sm:w-52 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="shrink-0 text-right pt-0.5">
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse ml-auto" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1 sm:pt-2">
          <div className="w-14 h-9 bg-gray-200 rounded-md animate-pulse" />
          <div className="w-14 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartItem
