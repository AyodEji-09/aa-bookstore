const SkeletonCartItem = () => {
  return (
    <div className="py-4 sm:py-6 flex gap-4 sm:gap-6 items-start border-b border-ui-border-base last:border-b-0">
      <div className="w-16 sm:w-24 h-24 sm:h-32 bg-gray-200 rounded-large animate-pulse shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch gap-y-3">
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
          <div className="flex flex-col gap-y-2">
            <div className="w-32 sm:w-48 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 sm:w-32 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-x-4 sm:gap-x-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="w-14 h-10 bg-gray-200 rounded-md animate-pulse" />
            </div>
            <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartItem
