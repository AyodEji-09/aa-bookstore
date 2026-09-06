import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listLibraryItems } from "@lib/data/library"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()
  const libraryItems = customer ? await listLibraryItems().catch(() => []) : []
  const resolvedParams = await searchParams

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      libraryItems={libraryItems}
      searchParams={resolvedParams}
    />
  )
}
