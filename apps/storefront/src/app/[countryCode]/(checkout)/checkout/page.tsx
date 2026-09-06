import {
  retrieveCart,
  setShippingMethod,
} from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listLibraryItems } from "@lib/data/library"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { isDigitalCart, isDigitalItem } from "@lib/util/is-digital"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  let cart = await retrieveCart()

  if (!cart || !cart.items?.length) {
    redirect(`/${countryCode}/cart`)
  }

  const customer = await retrieveCustomer()
  const containsDigital = cart.items.some(isDigitalItem)
  const isDigital = isDigitalCart(cart)

  // 1. If cart contains digital items and customer is unauthenticated, redirect to login
  if (containsDigital && !customer) {
    redirect(`/${countryCode}/account?return_url=/${countryCode}/checkout`)
  }

  // 2. If customer is logged in, check if any digital items in cart are already in their library
  if (customer && cart.items?.length) {
    const libraryItems = await listLibraryItems().catch(() => [])
    const duplicateItem = cart.items.find((item) => {
      if (!isDigitalItem(item)) return false
      const variantFormat =
        (item.variant?.metadata?.format as string) ||
        (item.variant_title?.toLowerCase().includes("audio")
          ? "audiobook"
          : "ebook")
      return libraryItems.some(
        (libItem) =>
          libItem.product?.id === item.product_id &&
          libItem.format === variantFormat
      )
    })

    if (duplicateItem) {
      redirect(
        `/${countryCode}/cart?error=already_owned&item=${encodeURIComponent(
          duplicateItem.title || "digital book"
        )}`
      )
    }
  }

  // 3. For purely digital carts: automatically attach the free Digital Delivery shipping option if not selected
  if (
    isDigital &&
    cart?.id &&
    (!cart.shipping_methods || cart.shipping_methods.length === 0)
  ) {
    try {
      const shippingOptions = await listCartShippingMethods(cart.id)
      const digitalOption =
        shippingOptions?.find((o) => o.name?.toLowerCase().includes("digital")) ||
        shippingOptions?.find((o) => o.amount === 0)
      if (digitalOption) {
        await setShippingMethod({
          cartId: cart.id,
          shippingMethodId: digitalOption.id,
        })
        cart = await retrieveCart()
      }
    } catch (err) {
      console.error("Auto digital shipping error in checkout page:", err)
    }
  }

  if (!cart || !cart.items?.length) {
    redirect(`/${countryCode}/cart`)
  }

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
