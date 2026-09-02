"use client"

import { Check } from "lucide-react"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const sortOptions = [
  {
    value: "created_at",
    label: "Latest Arrivals",
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const handleChange = (value: string) => {
    setQueryParams("sortBy", value as SortOptions)
  }

  return (
    <div className="flex flex-col gap-y-3" data-testid={dataTestId}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
        Sort By
      </h3>
      <div className="flex flex-col gap-y-1.5">
        {sortOptions.map((option) => {
          const isSelected = option.value === sortBy
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value)}
              className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
                isSelected
                  ? "bg-red-50 text-[#980000] font-bold"
                  : "text-[#4D4C4C] hover:bg-gray-50 hover:text-black"
              }`}
            >
              <span>{option.label}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-[#980000]" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SortProducts
