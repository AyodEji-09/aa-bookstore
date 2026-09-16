"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import { ShoppingCart, ArrowRight } from "lucide-react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div className="h-full" onMouseEnter={openAndCancel} onMouseLeave={close}>
      <Popover className="relative h-full flex items-center">
        <PopoverButton as="div" className="h-full flex items-center justify-center focus:outline-none">
          <LocalizedClientLink
            className="w-9 h-9 rounded-full border border-gray-200 text-[#382C2C] flex items-center justify-center relative hover:border-[#980000] hover:text-[#980000] transition-colors"
            href="/cart"
            data-testid="nav-cart-link"
            title="Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#980000] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:flex small:flex-col absolute top-[calc(100%+12px)] right-0 bg-white border border-gray-100 rounded-lg shadow-lg w-[380px] sm:w-[420px] text-[#382C2C] z-30 max-h-[min(540px,calc(100vh-100px))] overflow-hidden before:content-[''] before:absolute before:-top-5 before:inset-x-0 before:h-5"
            data-testid="nav-cart-dropdown"
          >
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#382C2C]">
                  Shopping Cart
                </h3>
              </div>
              {totalItems > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-[#980000]">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <div className="overflow-y-auto flex-1 min-h-0 max-h-[220px] px-4 py-2 divide-y divide-gray-100 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-contain">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="py-3.5 first:pt-2 last:pb-2 grid grid-cols-[72px_1fr] gap-x-4 items-center"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="w-[72px] h-[72px] rounded-md overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-x-2">
                              <div className="flex flex-col min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-[#382C2C] truncate">
                                  <LocalizedClientLink
                                    href={`/products/${item.product_handle}`}
                                    data-testid="product-link"
                                    className="hover:text-[#980000] transition-colors"
                                  >
                                    {item.title}
                                  </LocalizedClientLink>
                                </h4>
                                <LineItemOptions
                                  variant={item.variant}
                                  data-testid="cart-item-variant"
                                  data-value={item.variant}
                                />
                                <span
                                  className="text-[11px] text-gray-500 mt-0.5"
                                  data-testid="cart-item-quantity"
                                  data-value={item.quantity}
                                >
                                  Qty: {item.quantity}
                                </span>
                              </div>
                              <div className="flex justify-end text-xs font-bold text-[#382C2C]">
                                <LineItemPrice
                                  item={item}
                                  style="tight"
                                  currencyCode={cartState.currency_code}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1">
                            <DeleteButton
                              id={item.id}
                              className="text-[11px] text-gray-400 hover:text-[#980000] transition-colors"
                              data-testid="cart-item-remove-button"
                            >
                              Remove
                            </DeleteButton>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="px-4 py-4 border-t border-gray-100 flex flex-col gap-y-3.5 text-xs shrink-0 bg-white sticky bottom-0 z-10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">
                      Subtotal{" "}
                      <span className="text-[10px] text-gray-400 font-normal">
                        (excl. taxes)
                      </span>
                    </span>
                    <span
                      className="text-sm font-bold text-[#382C2C]"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref className="w-full">
                    <button
                      className="w-full py-2.5 px-4 rounded-lg bg-[#980000] hover:bg-[#7a0000] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                      data-testid="go-to-cart-button"
                    >
                      <span>Go to cart</span>
                    </button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 text-[#980000] flex items-center justify-center mb-3">
                  <ShoppingCart className="w-8 h-8 text-[#980000]/80 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-[#382C2C] mb-1">
                  Your cart is empty
                </h4>
                <p className="text-xs text-gray-500 text-center max-w-[220px] leading-relaxed mb-5">
                  Explore our curated collection of bestselling books and
                  audiobooks.
                </p>
                <LocalizedClientLink
                  href="/store"
                  className="w-full max-w-[200px]"
                >
                  <button
                    onClick={close}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#980000] hover:bg-[#7a0000] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Explore Books</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </LocalizedClientLink>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
