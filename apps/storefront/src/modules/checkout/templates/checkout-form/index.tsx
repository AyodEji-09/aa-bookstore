import { listCartShippingMethods, listShippingStates } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import { isDigitalCart } from "@lib/util/is-digital"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const isDigital = isDigitalCart(cart)

  const rawShippingMethods = !isDigital
    ? await listCartShippingMethods(cart.id)
    : []

  const shippingStates = !isDigital ? await listShippingStates() : []

  // Physical carts must NEVER see or select digital shipping methods
  const shippingMethods = rawShippingMethods?.filter(
    (sm) =>
      !sm.name?.toLowerCase().includes("digital") &&
      (sm.metadata as Record<string, unknown> | undefined)?.is_digital !== true
  )

  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!paymentMethods || (!isDigital && !shippingMethods)) {
    return null
  }

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses
        cart={cart}
        customer={customer}
        isDigital={isDigital}
        shippingStates={shippingStates}
      />

      {!isDigital && (
        <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      )}

      <Payment cart={cart} availablePaymentMethods={paymentMethods} />

      <Review cart={cart} />
    </div>
  )
}
