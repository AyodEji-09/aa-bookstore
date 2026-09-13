import { Frown } from "lucide-react"

export default function EmptyStoreState() {
  return (
    <div
      className="w-full py-24 sm:py-32 flex flex-col items-center justify-center text-center"
      data-testid="empty-store-state"
    >
      <Frown className="w-16 h-16 text-gray-400 stroke-[1.5] mb-5" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        No products found
      </h3>
      <p className="text-sm text-gray-500">
        Try adjusting or clearing your filters.
      </p>
    </div>
  )
}
