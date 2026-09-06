"use client"

import { Button, Heading } from "@modules/common/components/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { isDigitalCart } from "@lib/util/is-digital"

type SummaryProps = {
  cart: HttpTypes.StoreCart
  hasDuplicateItems?: boolean
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  const isDigital = isDigitalCart(cart)
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (
    !isDigital &&
    (!cart?.shipping_methods?.length ||
      cart.shipping_methods.some((sm) =>
        sm.name?.toLowerCase().includes("digital")
      ))
  ) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, hasDuplicateItems = false }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      {hasDuplicateItems ? (
        <Button
          className="w-full h-10 opacity-60 cursor-not-allowed"
          disabled
        >
          Remove duplicate to checkout
        </Button>
      ) : (
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
        >
          <Button className="w-full h-10">Go to checkout</Button>
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default Summary
