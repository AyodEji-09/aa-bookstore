const SkeletonCartItem = () => {
  return (
    <div className="py-6 sm:py-8 flex gap-4 sm:gap-6 items-start justify-between">
      <div className="flex gap-4 sm:gap-6 items-start flex-1 min-w-0">
        <div className="w-20 sm:w-24 h-24 sm:h-28 bg-gray-100 rounded shrink-0 animate-pulse" />
        <div className="flex-1 space-y-3 py-1">
          <div className="w-3/4 h-5 bg-gray-100 rounded animate-pulse" />
          <div className="w-1/3 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="flex items-center gap-3 pt-2">
            <div className="w-14 h-10 bg-gray-100 rounded-md animate-pulse" />
            <div className="w-12 h-4 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="w-16 h-5 bg-gray-100 rounded animate-pulse shrink-0" />
    </div>
  )
}

export default SkeletonCartItem
