const SkeletonProductPreview = () => {
  return (
    <div className="flex flex-col justify-between h-full bg-white animate-pulse">
      <div>
        {/* Book Cover Image Skeleton (3:4 aspect ratio matching product card) */}
        <div className="aspect-[3/4] w-full rounded-lg bg-gray-100 shadow-sm mb-4" />

        {/* Title & Author Skeleton */}
        <div className="space-y-1.5 mb-2">
          <div className="w-3/4 h-5 rounded bg-gray-100" />
          <div className="w-1/2 h-3.5 rounded bg-gray-100" />
        </div>

        {/* Price & Wishlist Heart Skeleton */}
        <div className="flex items-center justify-between my-2">
          <div className="w-16 h-5 rounded bg-gray-100" />
          <div className="w-7 h-7 rounded-full bg-gray-100" />
        </div>
      </div>

      {/* Add To Cart Button Skeleton */}
      <div className="mt-2">
        <div className="w-full h-[38px] rounded-md bg-gray-100" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
