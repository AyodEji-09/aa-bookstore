import { Metadata } from "next"
import { listLibraryItems } from "@lib/data/library"
import LibraryView from "@modules/account/components/library-view"

export const metadata: Metadata = {
  title: "My Digital Library | Ayodeji Anifowose Bookstore",
  description: "Access and stream your purchased eBooks and Audiobooks online.",
}

export default async function LibraryPage() {
  const items = await listLibraryItems()

  return <LibraryView items={items} />
}
