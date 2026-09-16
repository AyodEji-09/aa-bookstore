import { Metadata } from "next"
import { listWishlistItems } from "@lib/data/wishlist"
import WishlistView from "@modules/account/components/wishlist-view"

export const metadata: Metadata = {
  title: "My Wishlist | Ayodeji Anifowose Store",
  description: "View and manage your saved items.",
}

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const initialItems = await listWishlistItems()

  return <WishlistView initialItems={initialItems} countryCode={countryCode} />
}
