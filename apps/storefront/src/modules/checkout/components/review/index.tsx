"use client"

import { Heading, Text, clx } from "@modules/common/components/ui"
import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { isDigitalCart } from "@lib/util/is-digital"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && cart?.total === 0
  )

  const isDigital = isDigitalCart(cart)

  const previousStepsCompleted =
    cart.shipping_address &&
    (isDigital || (cart.shipping_methods?.length ?? 0) > 0) &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our{" "}
                <LocalizedClientLink href="/terms" className="underline hover:text-black font-semibold">
                  Terms of Use
                </LocalizedClientLink>
                , Terms of Sale and{" "}
                <LocalizedClientLink href="/shipping-returns" className="underline hover:text-black font-semibold">
                  Returns Policy
                </LocalizedClientLink>{" "}
                and acknowledge that you have read Ayodeji Anifowose Bookstore&apos;s{" "}
                <LocalizedClientLink href="/privacy" className="underline hover:text-black font-semibold">
                  Privacy Policy
                </LocalizedClientLink>
                .
              </Text>
            </div>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
