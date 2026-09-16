const SkeletonCartItem = () => {
  return (
    <div className="py-5 sm:py-6 flex gap-4 sm:gap-6 items-start">
      <div className="w-20 sm:w-24 h-24 sm:h-28 bg-gray-200 rounded-md animate-pulse shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch min-h-[90px] sm:min-h-[105px]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="w-36 sm:w-52 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="sm:text-right shrink-0">
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse sm:ml-auto" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-3 sm:mt-0 pt-2 sm:pt-0">
          <div className="w-14 h-9 bg-gray-200 rounded-md animate-pulse" />
          <div className="w-14 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartItem
