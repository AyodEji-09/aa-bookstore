import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function AccountRootLayout(props: {
  children: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-between py-10 sm:py-14 px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center">
          {props.children}
        </div>
        <footer className="w-full pt-8 pb-2 text-center text-xs text-gray-400">
          <LocalizedClientLink
            href="/privacy"
            className="hover:text-black hover:underline transition-colors"
          >
            Privacy Policy
          </LocalizedClientLink>
        </footer>
      </div>
    )
  }

  const cart = await retrieveCart().catch(() => null)
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions().catch(() => ({
      shipping_options: [],
    }))
    shippingOptions = shipping_options
  }

  return (
    <>
      <Nav />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {props.children}
      <Footer />
    </>
  )
}
