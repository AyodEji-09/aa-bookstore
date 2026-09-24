const SkeletonCartTotals = ({ header = true }) => {
  return (
    <div className="flex flex-col">
      {header && <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-4" />}
      <div className="flex items-center justify-between">
        <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="flex items-center justify-between my-3">
        <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="flex items-center justify-between">
        <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="h-px w-full border-b border-gray-200 my-4" />

      <div className="flex items-center justify-between">
        <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="w-24 h-5 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}

export default SkeletonCartTotals
