import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { isDigitalItem } from "@lib/util/is-digital"
import { ExclamationCircle } from "@medusajs/icons"
import { LibraryItem } from "@lib/data/library"

const CartTemplate = ({
  cart,
  customer,
  libraryItems = [],
  searchParams,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  libraryItems?: LibraryItem[]
  searchParams?: { [key: string]: string | string[] | undefined }
}) => {
  const ownedItemIds = new Set<string>()
  let duplicateTitle: string | null = null

  if (customer && cart?.items?.length && libraryItems?.length) {
    for (const item of cart.items) {
      if (isDigitalItem(item)) {
        const variantFormat =
          (item.variant?.metadata?.format as string) ||
          (item.variant_title?.toLowerCase().includes("audio")
            ? "audiobook"
            : "ebook")
        const isOwned = libraryItems.some(
          (libItem) =>
            libItem.product?.id === item.product_id &&
            libItem.format === variantFormat
        )
        if (isOwned) {
          ownedItemIds.add(item.id)
          if (!duplicateTitle) {
            duplicateTitle = item.title || "digital book"
          }
        }
      }
    }
  }

  const hasDuplicateItems =
    ownedItemIds.size > 0 || searchParams?.error === "already_owned"
  const itemTitle = duplicateTitle || (searchParams?.item as string)

  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        {hasDuplicateItems && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-[#980000]/20 flex items-start gap-x-3 text-[#382C2C]">
            <ExclamationCircle className="w-5 h-5 text-[#980000] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-[#980000]">
                Action Required: Duplicate Digital Item
              </h4>
              <p className="text-xs mt-0.5 text-ui-fg-subtle">
                You already own {itemTitle ? `"${itemTitle}"` : "this item"} in your digital library. Please remove it from your cart to proceed to checkout.
              </p>
            </div>
          </div>
        )}

        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
            <div className="flex flex-col bg-white py-6 gap-y-6">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={cart} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {cart && cart.region && (
                  <>
                    <div className="bg-white py-6">
                      <Summary
                        cart={cart}
                        hasDuplicateItems={hasDuplicateItems}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
