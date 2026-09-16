import { Truck, Star, BookOpen } from "lucide-react"

const FeatureBar = () => {
  return (
    <div className="w-full bg-white py-10">
      <div className="content-container grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-red-200">
        {/* Item 1 */}
        <div className="flex items-center justify-center gap-x-3 py-4 md:py-0 md:px-6">
          <Truck className="w-7 h-7 text-[#382C2C]" />
          <span className="font-bold text-lg text-[#382C2C] tracking-tight">
            Free shiping over 50$
          </span>
        </div>

        {/* Item 2 */}
        <div className="flex items-center justify-center gap-x-3 py-4 md:py-0 md:px-6">
          <Star className="w-7 h-7 text-[#382C2C] fill-[#382C2C]" />
          <span className="font-bold text-lg text-[#382C2C] tracking-tight">
            Save with loyalty points
          </span>
        </div>

        {/* Item 3 */}
        <div className="flex items-center justify-center gap-x-3 py-4 md:py-0 md:px-6">
          <BookOpen className="w-7 h-7 text-[#382C2C]" />
          <span className="font-bold text-lg text-[#382C2C] tracking-tight underline underline-offset-4 cursor-pointer hover:text-[#980000] transition-colors">
            Read a few pages
          </span>
        </div>
      </div>
    </div>
  )
}

export default FeatureBar
