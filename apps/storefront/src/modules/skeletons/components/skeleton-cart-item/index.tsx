const SkeletonCartItem = () => {
  return (
    <div className="py-6 sm:py-8 flex gap-4 sm:gap-6 items-start justify-between border-b border-gray-100 last:border-b-0">
      <div className="flex gap-4 sm:gap-6 items-start flex-1 min-w-0">
        <div className="w-24 h-28 sm:w-28 sm:h-32 bg-gray-100 rounded-xl shrink-0 animate-pulse" />
        <div className="flex-1 space-y-2.5 py-1">
          <div className="w-28 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="w-48 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="w-20 h-5 bg-gray-100 rounded animate-pulse pt-1" />
          <div className="w-24 h-3.5 bg-gray-100 rounded animate-pulse pt-1" />
          <div className="w-32 h-3.5 bg-gray-100 rounded animate-pulse pt-2" />
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 pt-0.5">
        <div className="w-16 h-10 bg-gray-100 rounded-[2px] animate-pulse" />
        <div className="w-6 h-6 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  )
}

export default SkeletonCartItem
