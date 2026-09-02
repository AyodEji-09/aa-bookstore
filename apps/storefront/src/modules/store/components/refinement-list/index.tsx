"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { ChevronUp, ChevronDown, Check, SlidersHorizontal, RotateCcw } from "lucide-react"

import {
  OPTION_VALUE_QUERY_KEY,
  parseOptionValueIds,
} from "@lib/util/product-option-filters"
import OptionsPicker from "./options-picker"
import { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  hideOptionsPicker?: boolean
  "data-testid"?: string
}

const SORT_OPTIONS: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
]

const RefinementList = ({
  sortBy,
  hideOptionsPicker = false,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isSortOpen, setIsSortOpen] = useState(true)

  const updateQueryParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)

      params.delete("page")

      const queryString = params.toString()
      const currentQuery = searchParams.toString()
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname
      const currentPath = currentQuery
        ? `${pathname}?${currentQuery}`
        : pathname

      if (nextPath !== currentPath) {
        router.push(nextPath)
      }
    },
    [pathname, router, searchParams]
  )

  const handleSortChange = (value: SortOptions) => {
    updateQueryParams((params) => params.set("sortBy", value))
  }

  const selectedOptionValueIds = useMemo(
    () => parseOptionValueIds(searchParams),
    [searchParams]
  )

  const setOptionValueIds = (valueIds: string[]) =>
    updateQueryParams((params) => {
      params.delete(OPTION_VALUE_QUERY_KEY)
      valueIds.forEach((valueId) =>
        params.append(OPTION_VALUE_QUERY_KEY, valueId)
      )
    })

  const hasActiveFilters = selectedOptionValueIds.length > 0 || (sortBy && sortBy !== "created_at")

  const clearAllFilters = () => {
    updateQueryParams((params) => {
      params.delete(OPTION_VALUE_QUERY_KEY)
      params.delete("sortBy")
    })
  }

  return (
    <aside
      className="w-full small:w-60 flex-shrink-0 space-y-6 small:sticky small:top-28 self-start"
      data-testid={dataTestId}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-x-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#980000]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#382C2C]">
            Filter & Sort
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[11px] font-medium text-gray-400 hover:text-[#980000] flex items-center gap-x-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sort Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center justify-between w-full text-left py-0.5 group"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-[#382C2C]">
            Sort By
          </span>
          {isSortOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#382C2C] transition-colors" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#382C2C] transition-colors" />
          )}
        </button>

        {isSortOpen && (
          <div className="space-y-1.5 pt-1">
            {SORT_OPTIONS.map((option) => {
              const isSelected = option.value === sortBy
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSortChange(option.value)}
                  className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg text-left transition-all ${
                    isSelected
                      ? "bg-red-50/80 text-[#980000] font-bold"
                      : "text-[#4D4C4C] hover:bg-gray-50 hover:text-[#382C2C] font-medium"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#980000] stroke-[2.5]" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Product Options from Medusa */}
      {!hideOptionsPicker && (
        <OptionsPicker
          selectedValueIds={selectedOptionValueIds}
          setOptionValueIds={setOptionValueIds}
        />
      )}
    </aside>
  )
}

export default RefinementList
