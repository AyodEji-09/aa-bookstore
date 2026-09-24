"use client"

import { Fragment, useState, useEffect } from "react"
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { getPricesForVariant } from "@lib/util/get-product-price"
import { isDigitalVariant } from "@lib/util/is-digital"
import { X, Check, Loader2 } from "lucide-react"

type MobileFormatDrawerProps = {
  isOpen: boolean
  onClose: () => void
  product?: HttpTypes.StoreProduct
  variants: HttpTypes.StoreProductVariant[]
  countryCode: string
  onAddToCart: (variantId: string) => Promise<void>
  isAddingId: string | null
  successId: string | null
}

const isVariantInStock = (v: HttpTypes.StoreProductVariant) => {
  if (isDigitalVariant(v)) return true
  if (!v.manage_inventory) return true
  if (v.allow_backorder) return true
  return (v.inventory_quantity ?? 0) > 0
}

export default function MobileFormatDrawer({
  isOpen,
  onClose,
  product,
  variants = [],
  countryCode: _countryCode,
  onAddToCart,
  isAddingId,
  successId,
}: MobileFormatDrawerProps) {
  const initialVariant = variants.find(isVariantInStock) || variants[0]
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    initialVariant?.id || ""
  )

  useEffect(() => {
    if (isOpen) {
      const active = variants.find(isVariantInStock) || variants[0]
      if (active?.id) {
        setSelectedVariantId(active.id)
      }
    }
  }, [isOpen, variants])

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0]

  const priceData = selectedVariant
    ? getPricesForVariant(
        selectedVariant as unknown as Parameters<typeof getPricesForVariant>[0]
      )
    : null
  const isDigital = selectedVariant ? isDigitalVariant(selectedVariant) : false
  const inStock = selectedVariant ? isVariantInStock(selectedVariant) : true
  const author =
    (product?.metadata?.author as string) ||
    product?.subtitle ||
    "Ayodeji Anifowose"

  const isAddingThis = !!selectedVariant && isAddingId === selectedVariant.id
  const isSuccessThis = !!selectedVariant && successId === selectedVariant.id

  const handleAdd = () => {
    if (selectedVariant?.id && inStock && !isAddingId) {
      onAddToCart(selectedVariant.id)
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[150]" onClose={onClose}>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-[160] overflow-hidden flex items-end justify-center pointer-events-none">
          <TransitionChild
            as={Fragment}
            enter="transition ease-out duration-300 transform"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition ease-in duration-200 transform"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <DialogPanel className="pointer-events-auto w-full max-w-lg bg-white rounded-t-md shadow-2xl p-5 pb-8 sm:pb-6 border-t border-gray-100 max-h-[85vh] overflow-y-auto no-scrollbar">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <DialogTitle className="text-xl font-extrabold text-[#382C2C] tracking-tight">
                  Choose Options
                </DialogTitle>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 -mr-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Format Section */}
              <div className="mt-4">
                <p className="text-sm font-bold tracking-wider text-[#382C2C] mb-2.5">
                  Format:
                </p>

                {/* Horizontal Format Pills */}
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {variants.map((v) => {
                    const isSelected = v.id === selectedVariantId
                    const variantInStock = isVariantInStock(v)
                    const formatLabel =
                      v.title || (isDigitalVariant(v) ? "Digital" : "Standard")

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`relative px-4 py-2.5 border text-sm transition-all flex items-center justify-center select-none overflow-hidden ${
                          isSelected
                            ? variantInStock
                              ? "border-[#980000] bg-[#980000]/5 text-[#382C2C] font-semibold shadow-sm after:absolute after:bottom-0 after:inset-x-0 after:h-1 after:bg-[#980000]"
                              : "border-[#980000] bg-gray-50/80 text-gray-400 font-normal shadow-sm after:absolute after:bottom-0 after:inset-x-0 after:h-1 after:bg-[#980000]"
                            : variantInStock
                            ? "border-[#980000] hover:bg-[#980000]/5 bg-white text-[#4D4C4C] font-semibold"
                            : "border-gray-200 bg-gray-50/80 text-gray-400 font-normal cursor-not-allowed"
                        }`}
                      >
                        <span>{formatLabel}</span>

                        {/* Diagonal Strikethrough for Out of Stock */}
                        {!variantInStock && (
                          <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            preserveAspectRatio="none"
                          >
                            <line
                              x1="0"
                              y1="100%"
                              x2="100%"
                              y2="0"
                              stroke="#9ca3af"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selected Item Details */}
              <div className="mt-5 pt-4">
                <h3 className="text-base sm:text-lg font-bold text-[#382C2C] leading-snug">
                  {product?.title}
                  {selectedVariant?.title ? (
                    <span className="text-[#980000] font-semibold">
                      {" "}
                      ({selectedVariant.title})
                    </span>
                  ) : null}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {author}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 mt-2">
                  {priceData?.calculated_price ? (
                    <span className="text-xl font-extrabold text-[#382C2C]">
                      {priceData.calculated_price}
                    </span>
                  ) : null}

                  {priceData?.price_type === "sale" &&
                  Number(priceData?.percentage_diff) > 0 ? (
                    <>
                      {priceData.original_price &&
                      priceData.original_price !==
                        priceData.calculated_price ? (
                        <span className="text-sm line-through text-gray-400 font-medium">
                          {priceData.original_price}
                        </span>
                      ) : null}

                      <span className="text-xs font-bold text-[#980000] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                        Save {priceData.percentage_diff}%
                      </span>
                    </>
                  ) : null}
                </div>

                {/* Stock Notice */}
                <div className="mt-3">
                  {!inStock ? (
                    <p className="text-xs text-gray-500 font-medium">
                      This item is currently out of stock online.
                    </p>
                  ) : isDigital ? (
                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      Instant digital delivery to your account library
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      In stock • Ready for dispatch
                    </p>
                  )}
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="mt-6">
                {!inStock ? (
                  <button
                    disabled
                    type="button"
                    className="w-full py-3.5 px-4 bg-gray-200 text-gray-400 text-sm font-bold rounded-lg cursor-not-allowed text-center"
                  >
                    Sold out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isAddingThis}
                    className="w-full py-3.5 px-4 bg-[#980000] hover:bg-[#7a0000] active:scale-[0.99] text-white text-sm font-bold rounded-lg transition-all shadow-md gap-2 disabled:opacity-75"
                  >
                    {isSuccessThis ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Added to cart!</span>
                      </>
                    ) : isAddingThis ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Adding to cart...</span>
                      </>
                    ) : (
                      <>
                        <span>Add to cart</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
