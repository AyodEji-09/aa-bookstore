"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Fragment, useCallback, useMemo, useState } from "react"
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react"
import {
  ChevronUp,
  ChevronDown,
  Check,
  SlidersHorizontal,
  RotateCcw,
  X,
} from "lucide-react"
import { HttpTypes } from "@medusajs/types"

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
  productOptions?: HttpTypes.StoreProductOption[]
  children?: React.ReactNode
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
  productOptions,
  children,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isMobileOpen, setIsMobileOpen] = useState(false)
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

  const hasActiveSort = Boolean(sortBy && sortBy !== "created_at")
  const totalActiveCount =
    selectedOptionValueIds.length + (hasActiveSort ? 1 : 0)
  const hasActiveFilters = totalActiveCount > 0

  const clearAllFilters = () => {
    updateQueryParams((params) => {
      params.delete(OPTION_VALUE_QUERY_KEY)
      params.delete("sortBy")
    })
  }

  const renderFilterSections = () => (
    <div className="space-y-6">
      {/* Sort Section with Checkboxes */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center justify-between w-full text-left py-0.5 group focus:outline-none"
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
          <div className="space-y-1 pt-1">
            {SORT_OPTIONS.map((option) => {
              const isSelected = option.value === sortBy
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSortChange(option.value)}
                  className="flex items-center justify-between w-full px-2.5 py-2 text-xs rounded-md text-left text-[#4D4C4C] hover:bg-gray-50 hover:text-[#382C2C] transition-colors group cursor-pointer"
                >
                  <span
                    className={
                      isSelected
                        ? "font-semibold text-[#382C2C]"
                        : "font-normal"
                    }
                  >
                    {option.label}
                  </span>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                      isSelected
                        ? "bg-[#980000] border-[#980000] text-white"
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Product Options from Medusa */}
      {!hideOptionsPicker && (
        <OptionsPicker
          options={productOptions}
          selectedValueIds={selectedOptionValueIds}
          setOptionValueIds={setOptionValueIds}
        />
      )}
    </div>
  )

  return (
    <div className="w-full" data-testid={dataTestId}>
      {/* Mobile Screen Filter & Sort Trigger */}
      <div className="small:hidden flex items-center justify-between pb-4">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-gray-200 text-xs font-semibold text-[#4D4C4C] hover:border-[#980000] hover:text-[#980000] bg-white transition-all group"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#980000]" />
          <span>Filter & Sort</span>
          {hasActiveFilters && (
            <span className="w-4 h-4 rounded-full bg-[#980000] text-white text-[10px] font-bold flex items-center justify-center">
              {totalActiveCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-medium text-gray-400 hover:text-[#980000] flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Main Content Area: Desktop Sticky Sidebar + Content Grid */}
      <div className="flex flex-col small:flex-row small:items-start gap-8 w-full">
        {/* Desktop Sticky Sidebar (always visible on desktop, no toggle) */}
        <aside className="hidden small:block w-60 flex-shrink-0 space-y-6 small:sticky small:top-28 self-start">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-x-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#980000]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#382C2C]">
                Filter & Sort
              </h2>
              {hasActiveFilters && (
                <span className="w-4 h-4 rounded-full bg-[#980000] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalActiveCount}
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium text-gray-400 hover:text-[#980000] flex items-center gap-1 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
          {renderFilterSections()}
        </aside>

        {/* Content (Products Grid) */}
        <div className="w-full flex-1 min-w-0">{children}</div>
      </div>

      {/* Mobile Screen Dialog Drawer */}
      <Transition show={isMobileOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[110]"
          onClose={() => setIsMobileOpen(false)}
        >
          {/* Backdrop */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
          </TransitionChild>

          {/* Drawer Panel Container */}
          <div className="fixed inset-0 overflow-hidden z-[120]">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col justify-between">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#980000]" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#382C2C]">
                          Filter & Sort
                        </h3>
                        {hasActiveFilters && (
                          <span className="w-4 h-4 rounded-full bg-[#980000] text-white text-[10px] font-bold flex items-center justify-center">
                            {totalActiveCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={clearAllFilters}
                            className="text-xs font-medium text-gray-400 hover:text-[#980000] transition-colors"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsMobileOpen(false)}
                          className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors focus:outline-none"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Drawer Scrollable Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 no-scrollbar">
                      {renderFilterSections()}
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-4 bg-white">
                      <button
                        type="button"
                        onClick={() => setIsMobileOpen(false)}
                        className="w-full py-2.5 px-4 bg-[#980000] hover:bg-[#7a0000] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default RefinementList
