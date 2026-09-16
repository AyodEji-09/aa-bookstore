"use client"
import { setAddresses } from "@lib/data/cart"
import useToggleState from "@lib/hooks/use-toggle-state"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import { Heading, Text } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useMemo } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
  isDigital = false,
  shippingStates = [],
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  isDigital?: boolean
  shippingStates?: string[]
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  const countryCode = cart?.shipping_address?.country_code
  const countryName = useMemo(() => {
    if (!countryCode) return ""
    try {
      return (
        new Intl.DisplayNames(["en"], { type: "region" }).of(
          countryCode.toUpperCase()
        ) || countryCode.toUpperCase()
      )
    } catch {
      return countryCode.toUpperCase()
    }
  }, [countryCode])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline items-center"
        >
          {isDigital ? "Billing Details" : "Shipping Address"}
          {!isOpen && <CheckCircleSolid />}
        </Heading>
        {!isOpen && cart?.shipping_address && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-gray-900 hover:text-gray-600 font-medium transition-colors"
              data-testid="edit-address-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
              isDigital={isDigital}
              shippingStates={shippingStates}
            />

            {!isDigital && !sameAsBilling && (
              <div>
                <Heading
                  level="h2"
                  className="text-3xl-regular gap-x-4 pb-6 pt-8"
                >
                  Billing address
                </Heading>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              {isDigital ? "Continue to payment" : "Continue to delivery"}
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && cart.shipping_address ? (
              isDigital ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div
                    className="flex flex-col"
                    data-testid="shipping-contact-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Contact Information
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address.first_name}{" "}
                      {cart.shipping_address.last_name}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.email}
                    </Text>
                  </div>

                  <div
                    className="flex flex-col"
                    data-testid="shipping-address-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Billing & Delivery
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      Country: {countryName}
                    </Text>
                    <Text className="txt-medium text-[#980000] font-semibold mt-1">
                      Instant Digital Delivery
                    </Text>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-x-8">
                  <div className="flex items-start gap-x-1 w-full">
                    <div
                      className="flex flex-col w-1/3"
                      data-testid="shipping-address-summary"
                    >
                      <Text className="txt-medium-plus text-ui-fg-base mb-1">
                        Shipping Address
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.shipping_address.first_name}{" "}
                        {cart.shipping_address.last_name}
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.shipping_address.address_1}{" "}
                        {cart.shipping_address.address_2}
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.shipping_address.postal_code},{" "}
                        {cart.shipping_address.city}
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {countryName}
                      </Text>
                    </div>

                    <div
                      className="flex flex-col w-1/3 "
                      data-testid="shipping-contact-summary"
                    >
                      <Text className="txt-medium-plus text-ui-fg-base mb-1">
                        Contact
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.shipping_address.phone}
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {cart.email}
                      </Text>
                    </div>

                    <div
                      className="flex flex-col w-1/3"
                      data-testid="billing-address-summary"
                    >
                      <Text className="txt-medium-plus text-ui-fg-base mb-1">
                        Billing Address
                      </Text>

                      {sameAsBilling ? (
                        <Text className="txt-medium text-ui-fg-subtle">
                          Billing and delivery address are the same.
                        </Text>
                      ) : (
                        <>
                          <Text className="txt-medium text-ui-fg-subtle">
                            {cart.billing_address?.first_name}{" "}
                            {cart.billing_address?.last_name}
                          </Text>
                          <Text className="txt-medium text-ui-fg-subtle">
                            {cart.billing_address?.address_1}{" "}
                            {cart.billing_address?.address_2}
                          </Text>
                          <Text className="txt-medium text-ui-fg-subtle">
                            {cart.billing_address?.postal_code},{" "}
                            {cart.billing_address?.city}
                          </Text>
                          <Text className="txt-medium text-ui-fg-subtle">
                            {cart.billing_address?.country_code?.toUpperCase()}
                          </Text>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses
