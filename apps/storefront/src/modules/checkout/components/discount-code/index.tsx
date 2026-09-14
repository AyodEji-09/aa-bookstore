"use client"

import { Badge, Heading, Input, Text, clx } from "@modules/common/components/ui"
import React from "react"

import { applyPromotions } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import ChevronDown from "@modules/common/icons/chevron-down"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const { promotions = [] } = cart
  const removePromotionCode = async (code: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code
    )

    await applyPromotions(
      validPromotions.filter((p) => p.code !== undefined).map((p) => p.code!)
    )
  }

  const addPromotionCode = async (formData: FormData) => {
    setErrorMessage("")

    const code = formData.get("code")
    if (!code) {
      return
    }
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codes = promotions
      .filter((p) => p.code !== undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    try {
      await applyPromotions(codes)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
    }

    if (input) {
      input.value = ""
    }
  }

  return (
    <div className="w-full flex flex-col">
      <div className="txt-medium">
        <form action={(a) => addPromotionCode(a)} className="w-full">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="flex items-center gap-x-1.5 text-sm font-medium text-gray-700 hover:text-gray-950 transition-colors py-1"
            data-testid="add-discount-button"
          >
            <span>Have a promo code?</span>
            <ChevronDown
              size="14"
              className={clx(
                "transition-transform duration-200 text-gray-400",
                isOpen && "rotate-180"
              )}
            />
          </button>

          <div
            className={clx(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isOpen
                ? "max-h-24 opacity-100 translate-y-0 pt-2 pb-1"
                : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
            )}
          >
            <div className="flex w-full gap-x-2 items-center">
              <Input
                className="w-full h-10"
                id="promotion-input"
                name="code"
                type="text"
                placeholder="Enter promo code"
                autoFocus={false}
                data-testid="discount-input"
              />
              <SubmitButton
                variant="secondary"
                className="h-10 w-20 shrink-0 text-sm font-medium"
                data-testid="discount-apply-button"
              >
                Apply
              </SubmitButton>
            </div>

            <ErrorMessage
              error={errorMessage}
              data-testid="discount-error-message"
            />
          </div>
        </form>

        {promotions.length > 0 && (
          <div className="w-full flex items-center">
            <div className="flex flex-col w-full">
              <Heading className="txt-medium mb-2">
                Promotion(s) applied:
              </Heading>

              {promotions.map((promotion) => {
                return (
                  <div
                    key={promotion.id}
                    className="flex items-center justify-between w-full max-w-full mb-2"
                    data-testid="discount-row"
                  >
                    <Text className="flex gap-x-1 items-baseline txt-small-plus w-4/5 pr-1">
                      <span className="truncate" data-testid="discount-code">
                        <Badge
                          color={promotion.is_automatic ? "green" : "grey"}
                        >
                          {promotion.code}
                        </Badge>{" "}
                        (
                        {promotion.application_method?.value !== undefined &&
                          promotion.application_method.currency_code !==
                            undefined && (
                            <>
                              {promotion.application_method.type ===
                              "percentage"
                                ? `${promotion.application_method.value}%`
                                : convertToLocale({
                                    amount: +promotion.application_method.value,
                                    currency_code:
                                      promotion.application_method
                                        .currency_code,
                                  })}
                            </>
                          )}
                        )
                        {/* {promotion.is_automatic && (
                          <Tooltip content="This promotion is automatically applied">
                            <InformationCircleSolid className="inline text-zinc-400" />
                          </Tooltip>
                        )} */}
                      </span>
                    </Text>
                    {!promotion.is_automatic && (
                      <button
                        className="flex items-center"
                        onClick={() => {
                          if (!promotion.code) {
                            return
                          }

                          removePromotionCode(promotion.code)
                        }}
                        data-testid="remove-discount-button"
                      >
                        <Trash size={14} />
                        <span className="sr-only">
                          Remove discount code from order
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountCode
