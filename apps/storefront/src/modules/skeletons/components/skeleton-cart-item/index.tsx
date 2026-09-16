const SkeletonCartItem = () => {
  return (
    <div className="py-4 sm:py-5 flex flex-col gap-y-3 sm:gap-y-4">
      {/* Top: Image and Details */}
      <div className="flex gap-3.5 sm:gap-5 items-start">
        <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gray-200 rounded-md animate-pulse shrink-0" />
        <div className="space-y-2 min-w-0 flex-1">
          <div className="w-36 sm:w-52 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Bottom: Quantity and Remove */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="w-16 h-9 bg-gray-200 rounded-md animate-pulse" />
        <div className="w-14 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}

export default SkeletonCartItem
